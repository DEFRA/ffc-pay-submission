const db = require('../data')
const { findPaymentRequests } = require('./find-payment-requests')
const { removeQueues } = require('./remove-queues')
const { removeInvoiceLines } = require('./remove-invoice-lines')
const { removePaymentRequests } = require('./remove-payment-requests')

const removeAgreementData = async (retentionData) => {
  const transaction = await db.sequelize.transaction()
  try {
    const { agreementNumber, frn, schemeId } = retentionData

    const paymentRequests = await findPaymentRequests(agreementNumber, frn, schemeId, transaction)
    const paymentRequestIds = paymentRequests.map(pr => pr.paymentRequestId)
    if (paymentRequests.length === 0) {
      console.log('No agreement data to remove')
      await transaction.commit()
      return
    }

    await removeQueues(paymentRequestIds, transaction)
    await removeInvoiceLines(paymentRequestIds, transaction)
    await removePaymentRequests(paymentRequestIds, transaction)

    await transaction.commit()
  } catch (err) {
    await transaction.rollback()
    throw err
  }
}

module.exports = {
  removeAgreementData
}
