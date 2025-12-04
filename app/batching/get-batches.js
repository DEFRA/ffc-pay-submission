const db = require('../data')
const moment = require('moment')
const config = require('../config')

const getBatches = async (transaction, started = new Date()) => {
  const batches = await getPendingBatches(started, transaction)
  await updateStarted(batches, started, transaction)
  return batches
}

const getPendingBatches = async (started, transaction) => {
  const batches = await db.sequelize.query(`
    SELECT DISTINCT ON (batches."schemeId")
      batches.*
    FROM
      batches
    INNER JOIN "paymentRequests"
      ON "paymentRequests"."batchId" = batches."batchId"
    INNER JOIN "invoiceLines"
      ON "invoiceLines"."paymentRequestId" = "paymentRequests"."paymentRequestId"
    WHERE batches.published IS NULL
      AND ("batches"."started" IS NULL OR "batches"."started" <= :delay)
    ORDER BY batches."schemeId", batches.sequence
    FOR UPDATE OF batches SKIP LOCKED
    LIMIT :batchCap
    `, {
    replacements: {
      delay: moment(started).subtract(5, 'minutes').toDate(),
      batchCap: config.batchCap
    },
    transaction,
    raw: true,
    type: db.Sequelize.QueryTypes.SELECT
  })

  if (!batches.length) {
    return []
  }

  const paymentRequests = await db.paymentRequest.findAll({
    transaction,
    include: [{
      model: db.invoiceLine,
      as: 'invoiceLines',
      required: true
    }],
    where: {
      batchId: {
        [db.Sequelize.Op.in]: batches.map(x => x.batchId)
      }
    }
  })

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

  return batches.map(x => ({
    ...x,
    paymentRequests: paymentRequests.filter(y => y.batchId === x.batchId).map(x => x.get({ plain: true })),
    scheme: schemes.find(y => y.schemeId === x.schemeId).get({ plain: true })
  }))
}

const updateStarted = async (batches, started, transaction) => {
  for (const batch of batches) {
    await db.batch.update({ started }, {
      where: {
        batchId: batch.batchId
      },
      transaction
    })
  }
}

module.exports = getBatches
