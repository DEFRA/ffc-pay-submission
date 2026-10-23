const { EventPublisher } = require('ffc-pay-event-publisher')
const config = require('../config')
const { SOURCE } = require('../constants/source')
const { DUPLICATE_PAYMENT_WARNING } = require('../constants/events')

const MESSAGE = 'Duplicate payment request received for invoice number:'

const sendDuplicatePaymentEvent = async (paymentRequest) => {
  const event = {
    source: SOURCE,
    type: DUPLICATE_PAYMENT_WARNING,
    subject: paymentRequest.invoiceNumber,
    data: {
      ...paymentRequest,
      message: MESSAGE
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendDuplicatePaymentEvent
