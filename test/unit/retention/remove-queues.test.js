const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['queue'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { removeQueues } = require('../../../app/retention/remove-queues')

describe('removeQueues', () => {
  const paymentRequestIds = [101, 102]

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('deletes by payment request ids against the transaction', async () => {
    await removeQueues(paymentRequestIds, mockDb.trx)

    expect(mockDb.tables.queue).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.whereIn).toHaveBeenCalledWith('paymentRequestId', paymentRequestIds)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool if no transaction provided', async () => {
    await removeQueues(paymentRequestIds)

    expect(mockDb.tables.queue).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.del).toHaveBeenCalledTimes(1)
  })

  test('uses the pool if transaction is null', async () => {
    await removeQueues(paymentRequestIds, null)

    expect(mockDb.tables.queue).toHaveBeenCalledWith(undefined)
  })

  test('propagates errors from the delete', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(removeQueues(paymentRequestIds, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
