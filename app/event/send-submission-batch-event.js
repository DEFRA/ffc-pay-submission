const config = require('../config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { PAYMENT_SUBMITTED } = require('../constants/events')

const sendSubmissionBatchEvent = async (batch, filename) => {
  const events = batch.paymentRequests.map(paymentRequest => createEvent(paymentRequest, filename))
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvents(events)
}

const createEvent = (paymentRequest, filename) => {
  return {
    source: SOURCE,
    type: PAYMENT_SUBMITTED,
    subject: filename,
    data: paymentRequest
  }
}

module.exports = sendSubmissionBatchEvent
