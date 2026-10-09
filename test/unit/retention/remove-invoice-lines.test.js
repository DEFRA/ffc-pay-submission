const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['invoiceLine'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeInvoiceLines } = require('../../../app/retention/remove-invoice-lines')

describe('removeInvoiceLines', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes by payment request ids against the transaction', async () => {
    await removeInvoiceLines(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool if no transaction provided', async () => {
    await removeInvoiceLines(paymentRequestIds)

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(undefined)
  })

  test('runs on the pool if transaction is null', async () => {
    await removeInvoiceLines(paymentRequestIds, null)

    expect(mockDb.tables.invoiceLine).toHaveBeenCalledWith(undefined)
  })

  test('propagates errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeInvoiceLines(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
