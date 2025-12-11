const config = require('../config')
const processPaymentMessage = require('./process-payment-message')
const { MessageReceiver } = require('ffc-messaging')
const { createDiagnosticsHandler } = require('./diagnostics')
const paymentReceivers = []

const start = async () => {
  for (let i = 0; i < config.submitSubscription.numberOfReceivers; i++) {
    let paymentReceiver  // eslint-disable-line
    const paymentAction = message => processPaymentMessage(message, paymentReceiver)
    paymentReceiver = new MessageReceiver(config.submitSubscription,, paymentAction)
    await paymentReceiver.subscribe(createDiagnosticsHandler(`payment-receiver-${i + 1}`))

    paymentReceivers.push(paymentReceiver)
    console.info(`Receiver ${i + 1} ready to receive payment requests`)
  }
}

const stop = async () => {
  for (const paymentReceiver of paymentReceivers) {
    await paymentReceiver.closeConnection()
  }
}

module.exports = { start, stop }
