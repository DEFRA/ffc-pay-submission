jest.mock('ffc-messaging')
jest.mock('../../../app/data')

jest.mock('../../../app/inbound', () => jest.fn())

jest.mock('../../../app/event', () => ({
  sendProcessPaymentFailureEvent: jest.fn()
}))

const processPaymentMessage = require('../../../app/messaging/process-payment-message')
const savePaymentRequest = require('../../../app/inbound')
const { sendProcessPaymentFailureEvent } = require('../../../app/event')

let receiver

describe('process payment message', () => {
  beforeEach(() => {
    receiver = {
      completeMessage: jest.fn()
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('completes valid message', async () => {
    savePaymentRequest.mockResolvedValue(undefined)

    const message = {
      body: { frn: 1234567890 }
    }

    await processPaymentMessage(message, receiver)

    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })

  test('should send event when inbound save fails', async () => {
    savePaymentRequest.mockRejectedValue(new Error('boom'))

    const message = {
      body: { frn: 1234567890 }
    }

    await processPaymentMessage(message, receiver)

    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(sendProcessPaymentFailureEvent).toHaveBeenCalled()
  })
})
