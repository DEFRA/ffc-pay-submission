const raiseEvent = require('./raise-event')
const { v4: uuidv4 } = require('uuid')

const sendSubmissionTransferEvent = async (filename, batch) => {
  const batchId = batch.batchId
  const ledger = batch.ledger
  for (const paymentRequest of batch.paymentRequests) {
    const correlationId = paymentRequest?.correlationId ?? uuidv4()
    const event = {
      id: correlationId,
      name: 'payment-request-submission-file-transfer',
      type: 'info',
      message: 'Transfer file for payment request',
      data: { batchId, filename, ledger }
    }
    await raiseEvent(event)
  }
}

module.exports = sendSubmissionTransferEvent
