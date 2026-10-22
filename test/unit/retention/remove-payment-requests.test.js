const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removePaymentRequests } = require('../../../app/retention/remove-payment-requests')

describe('removePaymentRequests', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes by payment request ids against the transaction', async () => {
    await removePaymentRequests(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('runs on the pool if no transaction provided', async () => {
    await removePaymentRequests(paymentRequestIds)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('runs on the pool if transaction is null', async () => {
    await removePaymentRequests(paymentRequestIds, null)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('propagates errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removePaymentRequests(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
