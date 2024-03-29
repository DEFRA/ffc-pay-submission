const db = require('../data')

const completeBatch = async (batchId, transaction) => {
  const batch = await db.batch.findByPk(batchId, {
    transaction
  })
  // Check if completed already in case of duplicate processing
  if (batch.published === null) {
    await db.batch.update({ published: new Date() }, { where: { batchId }, transaction })
  }
}

module.exports = completeBatch
