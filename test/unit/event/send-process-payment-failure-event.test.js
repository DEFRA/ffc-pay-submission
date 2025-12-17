jest.mock('../../../app/config/mq-config', () => ({
  eventsTopic: 'test-events-topic'
}))

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvent: jest.fn()
  }))
}))

const messageConfig = require('../../../app/config/mq-config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const sendProcessPaymentFailureEvent = require('../../../app/event/send-process-payment-failure-event')

describe('sendProcessPaymentFailureEvent', () => {
  let mockPublishEvent
  let mockEventPublisher

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublishEvent = jest.fn()
    mockEventPublisher = {
      publishEvent: mockPublishEvent
    }
    EventPublisher.mockImplementation(() => mockEventPublisher)
  })

  test('publishes payment failure event with correct structure', async () => {
    const data = { paymentId: 'PAY-123', amount: 500 }
    const type = 'payment-processing-failed'
    const error = 'Insufficient funds'

    await sendProcessPaymentFailureEvent(data, type, error)

    expect(EventPublisher).toHaveBeenCalledWith('test-events-topic')
    expect(mockPublishEvent).toHaveBeenCalledWith({
      source: 'ffc-pay-submission',
      type: 'payment-processing-failed',
      subject: 'Process Payment Failure',
      data: {
        message: 'Insufficient funds',
        paymentId: 'PAY-123',
        amount: 500
      }
    })
  })

  test('publishes event with multiple data properties', async () => {
    const data = {
      paymentId: 'PAY-456',
      amount: 1000,
      accountNumber: 'ACC-789',
      reference: 'REF-001'
    }
    const type = 'payment-rejected'
    const error = 'Account validation failed'

    await sendProcessPaymentFailureEvent(data, type, error)

    expect(mockPublishEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: 'Account validation failed',
          paymentId: 'PAY-456',
          amount: 1000,
          accountNumber: 'ACC-789',
          reference: 'REF-001'
        })
      })
    )
  })

  test('publishes event with empty data object', async () => {
    const data = {}
    const type = 'payment-error'
    const error = 'Service unavailable'

    await sendProcessPaymentFailureEvent(data, type, error)

    expect(mockPublishEvent).toHaveBeenCalledWith({
      source: 'ffc-pay-submission',
      type: 'payment-error',
      subject: 'Process Payment Failure',
      data: {
        message: 'Service unavailable'
      }
    })
  })

  test('creates EventPublisher with correct topic from config', async () => {
    await sendProcessPaymentFailureEvent({ paymentId: '123' }, 'test-type', 'test-error')

    expect(EventPublisher).toHaveBeenCalledWith(messageConfig.eventsTopic)
  })
})
