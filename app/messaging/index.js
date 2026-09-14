const config = require('../config')
const { createServiceBusClient, createReceiver, subscribeReceiver, closeSenders } = require('./service-bus')
const processPaymentMessage = require('./process-payment-message')
const { processRetentionMessage } = require('./process-retention-message')
const { createDiagnosticsHandler } = require('./diagnostics')

let sbClient
let retentionReceiver
let paymentReceiver

const receivers = []

const start = async () => {
  sbClient = createServiceBusClient(config.submitSubscription)
  for (let i = 0; i < config.submitSubscription.numberOfReceivers; i++) {
    paymentReceiver = createReceiver(sbClient, config.submitSubscription)
    subscribeReceiver(paymentReceiver, processPaymentMessage, createDiagnosticsHandler(`payment-receiver-${i + 1}`), config.submitSubscription)

    receivers.push(paymentReceiver)
    console.info(`Payment receiver ${i + 1} ready to receive payment requests`)
  }

  retentionReceiver = createReceiver(sbClient, config.retentionSubscription)
  subscribeReceiver(retentionReceiver, processRetentionMessage, createDiagnosticsHandler('retention-receiver'), config.retentionSubscription)
  receivers.push(retentionReceiver)
  console.info('Retention receiver ready')
}

const stop = async () => {
  for (const receiver of receivers) {
    try {
      receiver.close()
    } catch (error) {
      console.error(`Error closing receiver: ${error.message}`)
    }
  }
  receivers.length = 0
  if (sbClient) {
    try {
      await sbClient.close()
    } catch (error) {
      console.error(`Error closing service bus client: ${error.message}`)
    }
    sbClient = null
    await closeSenders()
  }
}

module.exports = { start, stop }
