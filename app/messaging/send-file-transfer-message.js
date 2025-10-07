const { MessageSender } = require('ffc-messaging')
const createMessage = require('./create-message')
const { sendTopic } = require('../config')
const { sendSubmissionTransferEvent } = require('../event')

const sendFileTransferMessage = async (filename, batch) => {
  const ledger = batch.ledger
  const message = createMessage(filename, ledger)
  const sender = new MessageSender(sendTopic)
  await sender.sendMessage(message)
  await sendSubmissionTransferEvent(filename)
  await sender.closeConnection()
}

module.exports = sendFileTransferMessage
