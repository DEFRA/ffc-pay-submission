jest.mock('../../../app/config', () => ({
  eventsTopic: 'test-events-topic'
}))

const mockPublishEvents = jest.fn()

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvents: mockPublishEvents
  }))
}))

const config = require('../../../app/config')
const { EventPublisher } = require('ffc-pay-event-publisher')
const { SOURCE } = require('../../../app/constants/source')
const { DUPLICATE_PAYMENT_WARNING, DUPLICATE_PAYMENT } = require('../../../app/constants/events')
const sendDuplicatePaymentEvent = require('../../../app/event/send-duplicate-payment-event')

const MESSAGE = 'Duplicate payment request received for invoice number:'
const REFERENCE_ID = '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c'

let paymentRequest

const getEvents = () => mockPublishEvents.mock.calls[0][0]

describe('send events for duplicate payment requests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    paymentRequest = { ...structuredClone(require('../../mocks/payment-requests/payment-request')), referenceId: REFERENCE_ID }
  })

  test('should send events to V2 topic', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(EventPublisher).toHaveBeenCalledWith(config.eventsTopic)
  })

  test('should raise a warning event and a payment event', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    expect(getEvents().map(event => event.type)).toEqual([DUPLICATE_PAYMENT_WARNING, DUPLICATE_PAYMENT])
  })

  test.each([
    ['submission source', (event) => expect(event.source).toBe(SOURCE)],
    ['invoice number subject', (event) => expect(event.subject).toBe(paymentRequest.invoiceNumber)]
  ])('should validate %s for both events', async (_desc, assertion) => {
    await sendDuplicatePaymentEvent(paymentRequest)
    getEvents().forEach(assertion)
  })

  test('should raise warning event with duplicate payment data', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    const [warningEvent] = getEvents()
    expect(warningEvent.data).toEqual({
      message: MESSAGE,
      invoiceNumber: paymentRequest.invoiceNumber,
      referenceId: REFERENCE_ID,
      sourceSystem: paymentRequest.sourceSystem,
      schemeId: paymentRequest.schemeId
    })
  })

  test('should raise payment event with payment request data', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    const [, paymentEvent] = getEvents()
    expect(paymentEvent.data).toEqual({
      ...paymentRequest,
      message: MESSAGE
    })
  })

  test('should raise payment event with identifiers needed to link it to the payment request', async () => {
    await sendDuplicatePaymentEvent(paymentRequest)
    const [, paymentEvent] = getEvents()
    expect(paymentEvent.data.frn).toBe(paymentRequest.frn)
    expect(paymentEvent.data.correlationId).toBe(paymentRequest.correlationId)
    expect(paymentEvent.data.invoiceNumber).toBe(paymentRequest.invoiceNumber)
    expect(paymentEvent.data.referenceId).toBe(REFERENCE_ID)
  })
})
