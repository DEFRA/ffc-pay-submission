const saveInvoiceLines = require('../../../app/inbound/save-invoice-lines')
const db = require('../../../app/data')
const { sanitizeInvoiceLine } = require('../../../app/inbound/sanitize-invoice-line')

jest.mock('../../../app/data')
jest.mock('../../../app/inbound/sanitize-invoice-line')

describe('saveInvoiceLines', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should save a single invoice line with paymentRequestId', async () => {
    const invoiceLine = { invoiceLineId: '123', description: 'Test Item', value: 100 }
    const paymentRequestId = 'PR-001'
    const transaction = {}

    db.invoiceLine.create.mockResolvedValue({ id: 1, ...invoiceLine, paymentRequestId })

    await saveInvoiceLines([invoiceLine], paymentRequestId, transaction)

    expect(db.invoiceLine.create).toHaveBeenCalledTimes(1)
    expect(db.invoiceLine.create).toHaveBeenCalledWith(
      { description: 'Test Item', value: 100, paymentRequestId },
      { transaction }
    )
  })

  test('should save multiple invoice lines', async () => {
    const invoiceLines = [
      { invoiceLineId: '1', description: 'Item 1', value: 50 },
      { invoiceLineId: '2', description: 'Item 2', value: 75 }
    ]
    const paymentRequestId = 'PR-002'
    const transaction = {}

    db.invoiceLine.create.mockResolvedValue({})

    await saveInvoiceLines(invoiceLines, paymentRequestId, transaction)

    expect(db.invoiceLine.create).toHaveBeenCalledTimes(2)
  })

  test('should remove invoiceLineId before saving', async () => {
    const invoiceLine = { invoiceLineId: 'should-be-deleted', description: 'Test' }
    const paymentRequestId = 'PR-003'
    const transaction = {}

    db.invoiceLine.create.mockResolvedValue({})

    await saveInvoiceLines([invoiceLine], paymentRequestId, transaction)

    const callArgs = db.invoiceLine.create.mock.calls[0][0]
    expect(callArgs).not.toHaveProperty('invoiceLineId')
    expect(callArgs.description).toBe('Test')
  })

  test('should sanitize each invoice line', async () => {
    const invoiceLines = [
      { invoiceLineId: '1', description: 'Item 1' },
      { invoiceLineId: '2', description: 'Item 2' }
    ]
    const paymentRequestId = 'PR-004'
    const transaction = {}

    db.invoiceLine.create.mockResolvedValue({})

    await saveInvoiceLines(invoiceLines, paymentRequestId, transaction)

    expect(sanitizeInvoiceLine).toHaveBeenCalledTimes(2)
    expect(sanitizeInvoiceLine).toHaveBeenCalledWith(expect.objectContaining({ description: 'Item 1' }))
    expect(sanitizeInvoiceLine).toHaveBeenCalledWith(expect.objectContaining({ description: 'Item 2' }))
  })

  test('should pass transaction to database create method', async () => {
    const invoiceLine = { invoiceLineId: '1', description: 'Test' }
    const paymentRequestId = 'PR-005'
    const transaction = { id: 'transaction-123' }

    db.invoiceLine.create.mockResolvedValue({})

    await saveInvoiceLines([invoiceLine], paymentRequestId, transaction)

    expect(db.invoiceLine.create).toHaveBeenCalledWith(
      expect.any(Object),
      { transaction }
    )
  })

  test('should handle empty invoice lines array', async () => {
    const paymentRequestId = 'PR-006'
    const transaction = {}

    await saveInvoiceLines([], paymentRequestId, transaction)

    expect(db.invoiceLine.create).not.toHaveBeenCalled()
  })

  test('should throw error if database create fails', async () => {
    const invoiceLine = { invoiceLineId: '1', description: 'Test' }
    const paymentRequestId = 'PR-007'
    const transaction = {}
    const error = new Error('Database error')

    db.invoiceLine.create.mockRejectedValue(error)

    await expect(saveInvoiceLines([invoiceLine], paymentRequestId, transaction)).rejects.toThrow('Database error')
  })

  test('should include all invoice line properties except invoiceLineId in created record', async () => {
    const invoiceLine = {
      invoiceLineId: 'id-123',
      description: 'Test Item',
      value: 100,
      quantity: 2,
      customField: 'custom value'
    }
    const paymentRequestId = 'PR-008'
    const transaction = {}

    db.invoiceLine.create.mockResolvedValue({})

    await saveInvoiceLines([invoiceLine], paymentRequestId, transaction)

    const savedData = db.invoiceLine.create.mock.calls[0][0]
    expect(savedData).toEqual({
      description: 'Test Item',
      value: 100,
      quantity: 2,
      customField: 'custom value',
      paymentRequestId
    })
  })
})
