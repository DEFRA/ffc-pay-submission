const config = require('../config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../constants/source')
const { BATCH_CREATED } = require('../constants/events')

const sendSubmissionTransferEvent = async (filename, batch) => {
  if (config.useV2Events) {
    await sendV2SubmissionTransferEvent(filename, batch)
  }
}

const sendV2SubmissionTransferEvent = async (filename, batch) => {
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
