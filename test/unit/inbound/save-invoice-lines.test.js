const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['invoiceLine'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

jest.mock('../../../app/inbound/sanitize-invoice-line')

const saveInvoiceLines = require('../../../app/inbound/save-invoice-lines')
const { sanitizeInvoiceLine } = require('../../../app/inbound/sanitize-invoice-line')

describe('saveInvoiceLines', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('should save a single invoice line with paymentRequestId against the transaction', async () => {
    const invoiceLine = { invoiceLineId: '123', description: 'Test Item', value: 100 }
    const paymentRequestId = 'PR-001'

    await saveInvoiceLines([invoiceLine], paymentRequestId, mockDb.trx)

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.insert).toHaveBeenCalledTimes(1)
    expect(mockDb.builder.insert).toHaveBeenCalledWith(expect.objectContaining({ description: 'Test Item', value: 100, paymentRequestId }))
  })

  test('should save multiple invoice lines', async () => {
    const invoiceLines = [
      { invoiceLineId: '1', description: 'Item 1', value: 50 },
      { invoiceLineId: '2', description: 'Item 2', value: 75 }
    ]

    await saveInvoiceLines(invoiceLines, 'PR-002', mockDb.trx)

    expect(mockDb.builder.insert).toHaveBeenCalledTimes(2)
  })

  test('should remove invoiceLineId before saving', async () => {
    const invoiceLine = { invoiceLineId: 'should-be-deleted', description: 'Test' }

    await saveInvoiceLines([invoiceLine], 'PR-003', mockDb.trx)

    const savedData = mockDb.builder.insert.mock.calls[0][0]
    expect(savedData).not.toHaveProperty('invoiceLineId')
    expect(invoiceLine).not.toHaveProperty('invoiceLineId')
    expect(savedData.description).toBe('Test')
  })

  test('should sanitize each invoice line', async () => {
    const invoiceLines = [
      { invoiceLineId: '1', description: 'Item 1' },
      { invoiceLineId: '2', description: 'Item 2' }
    ]

    await saveInvoiceLines(invoiceLines, 'PR-004', mockDb.trx)

    expect(sanitizeInvoiceLine).toHaveBeenCalledTimes(2)
    expect(sanitizeInvoiceLine).toHaveBeenCalledWith(expect.objectContaining({ description: 'Item 1' }))
    expect(sanitizeInvoiceLine).toHaveBeenCalledWith(expect.objectContaining({ description: 'Item 2' }))
  })

  test('should run on the pool if no transaction provided', async () => {
    await saveInvoiceLines([{ description: 'Test' }], 'PR-005')

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(undefined)
  })

  test('should run on the pool if transaction is null', async () => {
    await saveInvoiceLines([{ description: 'Test' }], 'PR-005', null)

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(undefined)
  })

  test('should handle empty invoice lines array', async () => {
    await saveInvoiceLines([], 'PR-006', mockDb.trx)

    expect(mockDb.builder.insert).not.toHaveBeenCalled()
  })

  test('should throw error if database insert fails', async () => {
    mockDb.builder.rejects(new Error('Database error'))

    await expect(saveInvoiceLines([{ description: 'Test' }], 'PR-007', mockDb.trx)).rejects.toThrow('Database error')
  })

  test('should only save invoice line columns', async () => {
    const invoiceLine = {
      invoiceLineId: 'id-123',
      schemeCode: '80001',
      accountCode: 'SOS273',
      fundCode: 'DRD10',
      agreementNumber: 'SIP00000000000001',
      description: 'Test Item',
      value: 100,
      convergence: false,
      deliveryBody: 'RP00',
      marketingYear: 2022,
      quantity: 2,
      customField: 'custom value'
    }
    const paymentRequestId = 'PR-008'

    await saveInvoiceLines([invoiceLine], paymentRequestId, mockDb.trx)

    expect(mockDb.builder.insert).toHaveBeenCalledWith({
      paymentRequestId,
      schemeCode: '80001',
      accountCode: 'SOS273',
      fundCode: 'DRD10',
      agreementNumber: 'SIP00000000000001',
      description: 'Test Item',
      value: 100,
      convergence: false,
      deliveryBody: 'RP00',
      marketingYear: 2022
    })
  })
})
