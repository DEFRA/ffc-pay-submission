const db = require('../database')

const removeQueues = async (paymentRequestIds, transaction) => {
  await db.queue(transaction ?? undefined)
    .whereIn('paymentRequestId', paymentRequestIds)
    .del()
}

module.exports = {
  removeQueues
}
