const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')
const { messagingConfig } = require('../config')
const { sendSubmissionTransferEvent } = require('../event')

const sendFileTransferMessage = async (filename, batch) => {
  const ledger = batch.ledger
  const message = createMessage(filename, ledger)
  const sender = new MessageSender(messagingConfig.sendTopic)
  await sender.sendMessage(message)
  await sendSubmissionTransferEvent(filename, batch)
  await sender.closeConnection()
}

module.exports = sendFileTransferMessage
