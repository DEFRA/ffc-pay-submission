const config = require('../config/processing')
const messageConfig = require('../config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')

const sendProcessPaymentFailureEvent = async (data, type, error) => {
  if (config.useEvents) {
    const event = {
      source: 'ffc-pay-submission',
      type,
      subject: 'Process Payment Failure',
      data: {
        message: error,
        ...data
      }
    }
    const eventPublisher = new EventPublisher(messageConfig.eventsTopic)
    await eventPublisher.publishEvent(event)
  }
}

module.exports = sendProcessPaymentFailureEvent
