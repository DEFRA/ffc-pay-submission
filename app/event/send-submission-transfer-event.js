const { EventPublisher } = require('ffc-pay-event-publisher')
const config = require('../config')
const { SOURCE } = require('../constants/source')
const { BATCH_CREATED } = require('../constants/events')

const sendSubmissionTransferEvent = async (filename) => {
  const event = {
    source: SOURCE,
    type: BATCH_CREATED,
    subject: filename,
    data: {
      filename
    }
  }
  const eventPublisher = new EventPublisher(config.eventsTopic)
  await eventPublisher.publishEvent(event)
}

module.exports = sendSubmissionTransferEvent
