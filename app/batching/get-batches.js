const db = require('../data')
const moment = require('moment')
const config = require('../config')

const getBatches = async (transaction, started = new Date()) => {
  if (!transaction) {
    throw new Error('getBatches must be called with a transaction')
  }
  try {
    const batches = await getPendingBatches(started, transaction)
    await updateStarted(batches, started, transaction)
    return batches
  } catch (error) {
    console.error('Error in getBatches:', error)
    throw error
  }
}

const getPendingBatches = async (started, transaction) => {
  // Get one batch ID per scheme
  const batchIdRows = await db.sequelize.query(`
    SELECT "batchId"
    FROM (
      SELECT batches."batchId",
             ROW_NUMBER() OVER (
               PARTITION BY batches."schemeId"
               ORDER BY batches.sequence
             ) AS rn
      FROM batches
      INNER JOIN "paymentRequests"
        ON "paymentRequests"."batchId" = batches."batchId"
      INNER JOIN "invoiceLines"
        ON "invoiceLines"."paymentRequestId" = "paymentRequests"."paymentRequestId"
      WHERE batches.published IS NULL
        AND ("batches"."started" IS NULL OR "batches"."started" <= :delay)
    ) t
    WHERE rn = 1
    LIMIT :batchCap
  `, {
    replacements: {
      delay: moment(started).subtract(5, 'minutes').toDate(),
      batchCap: config.batchCap
    },
    transaction,
    type: db.Sequelize.QueryTypes.SELECT
  })

  const batchIds = batchIdRows.map(r => r.batchId)

  if (!batchIds.length) {
    return []
  }

  // Fetch full batch rows with FOR UPDATE
  const batches = await db.batch.findAll({
    where: { batchId: batchIds },
    transaction,
    lock: transaction.LOCK.UPDATE,
    raw: true
  })

  // Fetch payment requests with invoice lines
  const paymentRequests = await db.paymentRequest.findAll({
    transaction,
    include: [{
      model: db.invoiceLine,
      as: 'invoiceLines',
      required: true
    }],
    where: {
      batchId: batchIds
    }
  })

  // Fetch schemes with batch properties
  const schemes = await db.scheme.findAll({
    transaction,
    include: [{
      model: db.batchProperties,
      as: 'batchProperties',
      required: true
    }],
    where: {
      schemeId: {
        [db.Sequelize.Op.in]: paymentRequests.map(x => x.schemeId)
      }
    }
  })

  // Skip batches without a matching scheme (or transaction will fail for all)
  return batches
    .map(batch => {
      const scheme = schemes.find(s => s.schemeId === batch.schemeId)
      if (!scheme) return null

      return {
        ...batch,
        paymentRequests: paymentRequests
          .filter(pr => pr.batchId === batch.batchId)
          .map(pr => pr.get({ plain: true })),
        scheme: scheme.get({ plain: true })
      }
    })
    .filter(Boolean)
}

const updateStarted = async (batches, started, transaction) => {
  for (const batch of batches) {
    await db.batch.update({ started }, {
      where: { batchId: batch.batchId },
      transaction
    })
  }
}

module.exports = getBatches
