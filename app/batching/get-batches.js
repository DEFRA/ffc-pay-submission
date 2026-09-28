const db = require('../database')
const moment = require('moment')
const getBatchQuery = require('../constants/get-batch-query')

const invoiceLineColumns = [
  'invoiceLineId',
  'paymentRequestId',
  'schemeCode',
  'accountCode',
  'fundCode',
  'agreementNumber',
  'description',
  'value',
  'convergence',
  'deliveryBody',
  'marketingYear'
]

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
  const batchProcessingDelayMinutes = 5
  // Get one batch ID per scheme
  const { rows: batchIdRows } = await transaction.raw(getBatchQuery, {
    delay: moment(started).subtract(batchProcessingDelayMinutes, 'minutes').toDate()
  })

  const batchIds = batchIdRows.map(r => r.batchId)

  if (!batchIds.length) {
    return []
  }

  // Fetch full batch rows with FOR UPDATE
  const batches = await db.batch(transaction)
    .whereIn('batchId', batchIds)
    .forUpdate()

  // Fetch payment requests with invoice lines
  const paymentRequests = await getPaymentRequestsWithInvoiceLines(batchIds, transaction)

  // Fetch schemes with batch properties
  const schemes = await getSchemesWithBatchProperties(paymentRequests.map(x => x.schemeId), transaction)

  // Skip batches without a matching scheme (or transaction will fail for all)
  return batches
    .map(batch => {
      const scheme = schemes.find(s => s.schemeId === batch.schemeId)
      if (!scheme) {
        return null
      }

      return {
        ...batch,
        paymentRequests: paymentRequests.filter(pr => pr.batchId === batch.batchId),
        scheme
      }
    })
    .filter(Boolean)
}

const getPaymentRequestsWithInvoiceLines = async (batchIds, transaction) => {
  const paymentRequests = await db.paymentRequest(transaction)
    .whereIn('batchId', batchIds)
    .orderBy('paymentRequestId', 'asc')
  const invoiceLines = await db.invoiceLine(transaction)
    .select(invoiceLineColumns)
    .whereIn('paymentRequestId', paymentRequests.map(x => x.paymentRequestId))
    .orderBy('invoiceLineId', 'asc')

  // invoice lines were a required include, so a payment request without a line is not returned
  return paymentRequests
    .map(paymentRequest => ({
      ...paymentRequest,
      invoiceLines: invoiceLines.filter(x => x.paymentRequestId === paymentRequest.paymentRequestId)
    }))
    .filter(paymentRequest => paymentRequest.invoiceLines.length > 0)
}

const getSchemesWithBatchProperties = async (schemeIds, transaction) => {
  const schemes = await db.scheme(transaction).whereIn('schemeId', schemeIds)
  const batchProperties = await db.batchProperties(transaction).whereIn('schemeId', schemeIds)

  // batch properties were a required include, so a scheme without them is not returned
  return schemes
    .map(scheme => ({
      ...scheme,
      batchProperties: batchProperties.find(x => x.schemeId === scheme.schemeId)
    }))
    .filter(scheme => scheme.batchProperties)
}

const updateStarted = async (batches, started, transaction) => {
  for (const batch of batches) {
    await db.batch(transaction)
      .where({ batchId: batch.batchId })
      .update({ started })
  }
}

module.exports = getBatches
