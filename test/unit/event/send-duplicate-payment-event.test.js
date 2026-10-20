jest.mock('../../../app/config', () => ({
  eventsTopic: 'test-events-topic'
}))

const mockPublishEvent = jest.fn()

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvent: mockPublishEvent
  }))
}))

const config = require('../../../app/config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../../../app/constants/source')
const { DUPLICATE_PAYMENT_WARNING } = require('../../../app/constants/events')
const sendDuplicatePaymentEvent = require('../../../app/event/send-duplicate-payment-event')

const MESSAGE = 'Duplicate payment request received for invoice number:'
const REFERENCE_ID = '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c'

let paymentRequest

const getEvent = () => mockPublishEvent.mock.calls[0][0]

describe('send event for duplicate payment requests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    paymentRequest = { ...structuredClone(require('../../mocks/payment-requests/payment-request')), referenceId: REFERENCE_ID }
  })

  test('should send event to V2 topic', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(EventPublisher).toHaveBeenCalledWith(config.eventsTopic)
  })

  test('should raise a single warning event', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(mockPublishEvent).toHaveBeenCalledTimes(1)
    expect(getEvent().type).toBe(DUPLICATE_PAYMENT_WARNING)
  })

  test('should raise event with submission source', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(getEvent().source).toBe(SOURCE)
  })

  test('should raise event with invoice number subject', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(getEvent().subject).toBe(paymentRequest.invoiceNumber)
  })

  test('should raise warning event with payment request data', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(getEvent().data).toEqual({
      ...paymentRequest,
      message: MESSAGE
    })
  })

  test('should raise warning event with identifiers needed to link it to the payment request', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    const { data } = getEvent()
    expect(data.frn).toBe(paymentRequest.frn)
    expect(data.correlationId).toBe(paymentRequest.correlationId)
    expect(data.schemeId).toBe(paymentRequest.schemeId)
    expect(data.invoiceNumber).toBe(paymentRequest.invoiceNumber)
    expect(data.referenceId).toBe(REFERENCE_ID)
  })
})
