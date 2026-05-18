const db = require('../data')

const removeQueues = async (paymentRequestIds, transaction) => {
  await db.queue.destroy({
    where: {
      paymentRequestId: { [db.Sequelize.Op.in]: paymentRequestIds }
    },
    transaction
  })
}

module.exports = {
  removeQueues
}
