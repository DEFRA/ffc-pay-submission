const { removeQueues } = require('../../../app/retention/remove-queues')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  Sequelize: {
    Op: {
      in: 'IN_OPERATOR'
    }
  },
  queue: {
    destroy: jest.fn()
  }
}))

describe('removeQueues', () => {
  const paymentRequestIds = [101, 102]
  const transaction = { id: 'transaction-object' }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('calls db.queue.destroy with correct parameters', async () => {
    await removeQueues(paymentRequestIds, transaction)

    expect(db.queue.destroy).toHaveBeenCalledTimes(1)
    expect(db.queue.destroy).toHaveBeenCalledWith({
      where: {
        paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
      },
      transaction
    })
  })

  test('calls db.queue.destroy with undefined transaction if not provided', async () => {
    await removeQueues(paymentRequestIds)

    expect(db.queue.destroy).toHaveBeenCalledWith({
      where: {
        paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
      },
      transaction: undefined
    })
  })

  test('propagates errors from db.queue.destroy', async () => {
    const error = new Error('DB failure')
    db.queue.destroy.mockRejectedValue(error)

    await expect(removeQueues(paymentRequestIds, transaction)).rejects.toThrow('DB failure')
  })
})
