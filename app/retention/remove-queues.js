const db = require('../data')

const removeQueues = async (paymentRequestIds, transaction) => {
  await db.queue.destroy({
    where: { paymentRequestId: paymentRequestIds },
    transaction
  })
}

module.exports = {
  removeQueues
}
