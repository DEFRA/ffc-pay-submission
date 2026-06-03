const { MessageReceiver } = require('ffc-messaging')
const config = require('../config')
const processPaymentMessage = require('./process-payment-message')
const { processRetentionMessage } = require('./process-retention-message')
const { createDiagnosticsHandler } = require('./diagnostics')

let retentionReceiver
let paymentReceiver

const receivers = []

const start = async () => {
  for (let i = 0; i < config.submitSubscription.numberOfReceivers; i++) {
    const paymentAction = message => processPaymentMessage(message, paymentReceiver)
    paymentReceiver = new MessageReceiver(config.submitSubscription, paymentAction)
    await paymentReceiver.subscribe(createDiagnosticsHandler(`payment-receiver-${i + 1}`))

    receivers.push(paymentReceiver)
    console.info(`Payment receiver ${i + 1} ready to receive payment requests`)
  }

  const retentionAction = message => processRetentionMessage(message, retentionReceiver)
  retentionReceiver = new MessageReceiver(config.retentionSubscription, retentionAction)
  await retentionReceiver.subscribe(createDiagnosticsHandler('retention-receiver'))
  receivers.push(retentionReceiver)
  console.info('Retention receiver ready')
}

const stop = async () => {
  for (const receiver of receivers) {
    await receiver.closeConnection()
  }
}

module.exports = { start, stop }
