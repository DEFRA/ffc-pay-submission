const db = require('../database')

const completeBatch = async (batchId, transaction) => {
  const batch = (await db.batch(transaction ?? undefined)
    .where({ batchId })
    .first()) ?? null
  // Check if completed already in case of duplicate processing
  if (batch.published === null) {
    await db.batch(transaction ?? undefined)
      .where({ batchId })
      .update({ published: new Date() })
  }
}

module.exports = completeBatch
