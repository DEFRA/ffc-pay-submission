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

describe('process payment message (new fields)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('forwards new fields to inbound save unchanged', async () => {
    savePaymentRequest.mockResolvedValue(undefined)

    const body = {
      frn: 111122223333,
      fesCode: 'FES-ABC',
      annualValue: '9876543210.12',
      remmittanceDescription: 'Quarterly payment'
    }
    const message = { body }
    const receiver = { completeMessage: jest.fn() }

    await processPaymentMessage(message, receiver)

    expect(savePaymentRequest).toHaveBeenCalledTimes(1)
    expect(savePaymentRequest).toHaveBeenCalledWith(body)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })

  test('completes valid message when new fields are omitted', async () => {
    savePaymentRequest.mockResolvedValue(undefined)

    const message = {
      body: {
        frn: 444455556666
      }
    }
    const receiver = { completeMessage: jest.fn() }

    await processPaymentMessage(message, receiver)

    expect(savePaymentRequest).toHaveBeenCalledWith({ frn: 444455556666 })
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })

  test('should send failure event when inbound save fails (with new fields present)', async () => {
    savePaymentRequest.mockRejectedValue(new Error('boom'))

    const message = {
      body: {
        frn: 1234567890,
        fesCode: 'FES-ERR',
        annualValue: '100.00',
        remmittanceDescription: 'Should fail'
      }
    }
    const receiver = { completeMessage: jest.fn() }

    await processPaymentMessage(message, receiver)

    expect(receiver.completeMessage).not.toHaveBeenCalled()
    expect(sendProcessPaymentFailureEvent).toHaveBeenCalled()
  })

  test('does not mutate message body when forwarding to inbound save', async () => {
    savePaymentRequest.mockResolvedValue(undefined)

    const originalBody = Object.freeze({
      frn: 999888777666,
      fesCode: 'FES-IMMUT',
      annualValue: '123.45',
      remmittanceDescription: 'Immutability check'
    })
    const message = { body: originalBody }
    const receiver = { completeMessage: jest.fn() }

    await processPaymentMessage(message, receiver)

    expect(savePaymentRequest).toHaveBeenCalledWith(originalBody)
    expect(receiver.completeMessage).toHaveBeenCalledWith(message)
  })
})
