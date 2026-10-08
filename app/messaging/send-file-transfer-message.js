const { getSender, sendMessage } = require('./service-bus')
const createMessage = require('./create-message')
const { sendTopic } = require('../config')
const { sendSubmissionTransferEvent } = require('../event')

const sendFileTransferMessage = async (filename, batch) => {
  const ledger = batch.ledger
  const message = createMessage(filename, ledger)
  const sender = getSender(sendTopic)
  try {
    await sendMessage(sender, message)
    await sendSubmissionTransferEvent(filename)
  } finally {
    // sender is cached and closed by messaging.stop()
  }
}

module.exports = sendFileTransferMessage
