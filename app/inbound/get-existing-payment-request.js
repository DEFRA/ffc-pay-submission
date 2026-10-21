const db = require('../database')

const getExistingPaymentRequest = async (invoiceNumber, referenceId, transaction) => {
  const where = referenceId ? { referenceId } : { invoiceNumber }

  return (await db.paymentRequest(transaction ?? undefined)
    .select('paymentRequestId')
    .where(where)
    .first()) ?? null
}

module.exports = getExistingPaymentRequest
