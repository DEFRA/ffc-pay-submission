const db = require('../database')
const config = require('../config')
const { AP, AR } = require('../constants/ledgers')
const MAX_BATCH_SEQUENCE = 9999

const allocateToBatches = async (created = new Date()) => {
  const transaction = await db.transaction()
  try {
    const schemes = await getSchemes()
    for (const scheme of schemes) {
      const apPaymentRequests = await getPendingPaymentRequests(scheme.schemeId, AP, transaction)
      const arPaymentRequests = await getPendingPaymentRequests(scheme.schemeId, AR, transaction)
      if (apPaymentRequests.length) {
        await allocateToBatch(scheme.schemeId, apPaymentRequests, AP, created, transaction)
      }
      if (arPaymentRequests.length) {
        await allocateToBatch(scheme.schemeId, arPaymentRequests, AR, created, transaction)
      }
    }
    await transaction.commit()
  } catch (err) {
    console.log(err)
    await transaction.rollback()
    throw err
  }
}

const getSchemes = async () => {
  return db.scheme()
}

const getPendingPaymentRequests = async (schemeId, ledger, transaction) => {
  const { rows: queue } = await transaction.raw(`
    SELECT
      queue.*,
      "paymentRequests"."pillar"
    FROM "queue"
    INNER JOIN "paymentRequests" 
      ON "queue"."paymentRequestId" = "paymentRequests"."paymentRequestId"
    INNER JOIN "invoiceLines"
      ON "paymentRequests"."paymentRequestId" = "invoiceLines"."paymentRequestId"
    WHERE "paymentRequests"."schemeId" = :schemeId
      AND "paymentRequests"."ledger" = :ledger
      AND "queue"."batchId" IS NULL
    ORDER BY "queue"."paymentRequestId"
    LIMIT :batchSize
    FOR UPDATE OF "queue" SKIP LOCKED
  `, {
    schemeId,
    ledger,
    batchSize: config.batchSize
  })

  const nextPendingPillar = queue[0] ? queue[0].pillar : null

  return queue.filter(x => x.pillar === nextPendingPillar)
}

const allocateToBatch = async (schemeId, paymentRequests, ledger, created, transaction) => {
  const sequence = await getAndIncrementSequence(schemeId, ledger, transaction)
  const batch = await createNewBatch(schemeId, ledger, sequence, created, transaction)
  await updatePaymentRequests(paymentRequests, batch.batchId, transaction)
}

const getAndIncrementSequence = async (schemeId, ledger, transaction) => {
  const sequence = await getSequence(schemeId, transaction)
  let nextSequence
  if (ledger === AP) {
    nextSequence = sequence.nextAP
    sequence.nextAP = incrementSequence(sequence.nextAP)
    await updateSequence(sequence, transaction)
    return nextSequence
  }
  nextSequence = sequence.nextAR
  sequence.nextAR = incrementSequence(sequence.nextAR)
  await updateSequence(sequence, transaction)
  return nextSequence
}

const getSequence = async (schemeId, transaction) => {
  return (await db.sequence(transaction)
    .where({ schemeId })
    .forUpdate()
    .first()) ?? null
}

const incrementSequence = (currentSequence) => {
  // if sequence is already at maximum, then restart from 1
  return currentSequence < MAX_BATCH_SEQUENCE ? currentSequence + 1 : 1
}

const updateSequence = async (sequence, transaction) => {
  await db.sequence(transaction)
    .where({ schemeId: sequence.schemeId })
    .update({
      nextAP: sequence.nextAP,
      nextAR: sequence.nextAR
    })
}

const createNewBatch = async (schemeId, ledger, sequence, created, transaction) => {
  const [batch] = await db.batch(transaction)
    .insert({ schemeId, ledger, sequence, created })
    .returning('batchId')
  return batch
}

const updatePaymentRequests = async (paymentRequests, batchId, transaction) => {
  const paymentRequestIds = paymentRequests.map(x => x.paymentRequestId)
  await db.paymentRequest(transaction)
    .whereIn('paymentRequestId', paymentRequestIds)
    .update({ batchId })
  await db.queue(transaction)
    .whereIn('paymentRequestId', paymentRequestIds)
    .update({ batchId })
}

module.exports = allocateToBatches
