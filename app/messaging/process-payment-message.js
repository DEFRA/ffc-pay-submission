const savePaymentRequest = require('../inbound')
const { PAYMENT_PROCESSING_FAILED } = require('../constants/events')
const { sendProcessPaymentFailureEvent } = require('../event')

const processPaymentMessage = async (message, receiver) => {
  try {
    const paymentRequest = message.body
    await savePaymentRequest(paymentRequest)
    await receiver.completeMessage(message)
  } catch (err) {
    console.error('Unable to process payment request:', err)
    await sendProcessPaymentFailureEvent(message?.body, PAYMENT_PROCESSING_FAILED, err)
  }
}

module.exports = processPaymentMessage
