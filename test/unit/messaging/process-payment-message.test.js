jest.mock('ffc-messaging')
jest.mock('../../../app/data')
jest.mock('../../../app/inbound')
const processPaymentMessage = require('../../../app/messaging/process-payment-message')
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
    const message = {
      body: {
        frn: 1234567890
      }
    }
    await processPaymentMessage(message, receiver)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })
})
