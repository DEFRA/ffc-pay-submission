const { removeAgreementData } = require('../../../app/retention')
const db = require('../../../app/data')

jest.mock('../../../app/data', () => ({
  sequelize: {
    transaction: jest.fn()
  }
}))

jest.mock('../../../app/retention/find-payment-requests', () => ({
  findPaymentRequests: jest.fn()
}))

jest.mock('../../../app/retention/remove-queues', () => ({
  removeQueues: jest.fn()
}))

jest.mock('../../../app/retention/remove-invoice-lines', () => ({
  removeInvoiceLines: jest.fn()
}))

jest.mock('../../../app/retention/remove-payment-requests', () => ({
  removePaymentRequests: jest.fn()
}))

const { findPaymentRequests } = require('../../../app/retention/find-payment-requests')
const { removeQueues } = require('../../../app/retention/remove-queues')
const { removeInvoiceLines } = require('../../../app/retention/remove-invoice-lines')
const { removePaymentRequests } = require('../../../app/retention/remove-payment-requests')

describe('removeAgreementData', () => {
  const retentionData = {
    agreementNumber: 'AGR123',
    frn: 456789,
    schemeId: 10
  }
  let transaction

  beforeEach(() => {
    jest.clearAllMocks()

    transaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    }
    db.sequelize.transaction.mockResolvedValue(transaction)
  })

  test('commits transaction and returns early if no payment requests found', async () => {
    findPaymentRequests.mockResolvedValue([])

    const consoleInfoSpy = jest.spyOn(console, 'log').mockImplementation(() => { })

    await removeAgreementData(retentionData)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(findPaymentRequests).toHaveBeenCalledWith(
      retentionData.agreementNumber,
      retentionData.frn,
      retentionData.schemeId,
      transaction
    )
    expect(consoleInfoSpy).toHaveBeenCalledWith('No agreement data to remove')
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
    expect(removeQueues).not.toHaveBeenCalled()
    expect(removeInvoiceLines).not.toHaveBeenCalled()
    expect(removePaymentRequests).not.toHaveBeenCalled()

    consoleInfoSpy.mockRestore()
  })

  test('removes queues, invoice lines and payment requests when payment requests exist', async () => {
    const paymentRequests = [
      { paymentRequestId: 1 },
      { paymentRequestId: 2 }
    ]
    findPaymentRequests.mockResolvedValue(paymentRequests)
    removeQueues.mockResolvedValue()
    removeInvoiceLines.mockResolvedValue()
    removePaymentRequests.mockResolvedValue()

    await removeAgreementData(retentionData)

    const paymentRequestIds = paymentRequests.map(pr => pr.paymentRequestId)

    expect(db.sequelize.transaction).toHaveBeenCalledTimes(1)
    expect(findPaymentRequests).toHaveBeenCalledWith(
      retentionData.agreementNumber,
      retentionData.frn,
      retentionData.schemeId,
      transaction
    )
    expect(removeQueues).toHaveBeenCalledWith(paymentRequestIds, transaction)
    expect(removeInvoiceLines).toHaveBeenCalledWith(paymentRequestIds, transaction)
    expect(removePaymentRequests).toHaveBeenCalledWith(paymentRequestIds, transaction)
    expect(transaction.commit).toHaveBeenCalledTimes(1)
    expect(transaction.rollback).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if findPaymentRequests throws', async () => {
    const error = new Error('DB failure')
    findPaymentRequests.mockRejectedValue(error)

    await expect(removeAgreementData(retentionData)).rejects.toThrow('DB failure')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removeQueues throws', async () => {
    const paymentRequests = [{ paymentRequestId: 1 }]
    findPaymentRequests.mockResolvedValue(paymentRequests)
    removeQueues.mockRejectedValue(new Error('removeQueues error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removeQueues error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removeInvoiceLines throws', async () => {
    const paymentRequests = [{ paymentRequestId: 1 }]
    findPaymentRequests.mockResolvedValue(paymentRequests)
    removeQueues.mockResolvedValue()
    removeInvoiceLines.mockRejectedValue(new Error('removeInvoiceLines error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removeInvoiceLines error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })

  test('rolls back transaction and throws error if removePaymentRequests throws', async () => {
    const paymentRequests = [{ paymentRequestId: 1 }]
    findPaymentRequests.mockResolvedValue(paymentRequests)
    removeQueues.mockResolvedValue()
    removeInvoiceLines.mockResolvedValue()
    removePaymentRequests.mockRejectedValue(new Error('removePaymentRequests error'))

    await expect(removeAgreementData(retentionData)).rejects.toThrow('removePaymentRequests error')

    expect(transaction.rollback).toHaveBeenCalledTimes(1)
    expect(transaction.commit).not.toHaveBeenCalled()
  })
})
