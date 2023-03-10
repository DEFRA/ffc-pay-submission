const mockSendEvents = jest.fn()
const mockPublishEvents = jest.fn()
const MockPublishEventBatch = jest.fn().mockImplementation(() => {
  return {
    sendEvents: mockSendEvents
  }
})
const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvents: mockPublishEvents
  }
})
jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEventBatch: MockPublishEventBatch,
    EventPublisher: MockEventPublisher
  }
})
jest.mock('../../../app/config')
const config = require('../../../app/config')
const { PAYMENT_SUBMITTED } = require('../../../app/constants/events')
const { SOURCE } = require('../../../app/constants/source')
const sendSubmissionEvents = require('../../../app/event/send-submission-batch-event')

let paymentRequest
let paymentRequests

beforeEach(() => {
  paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-request')))
  paymentRequests = [paymentRequest, paymentRequest]

  config.useV1Events = true
  config.useV2Events = true
  config.eventTopic = 'v1-events'
  config.eventsTopic = 'v2-events'
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('V1 submission events event', () => {
  test('should send V1 event if V1 events enabled', async () => {
    config.useV1Events = true
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents).toHaveBeenCalled()
  })

  test('should not send V1 event if V1 events disabled', async () => {
    config.useV1Events = false
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents).not.toHaveBeenCalled()
  })

  test('should send event to V1 topic', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(MockPublishEventBatch.mock.calls[0][0]).toBe(config.eventTopic)
  })
  test('should use correlation Id as Id', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].properties.id).toBe(paymentRequests[0].correlationId)
  })

  test('should raise payment-request-processing event name', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].name).toBe('payment-request-processing')
  })

  test('should raise success status event', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].properties.status).toBe('success')
  })

  test('should raise error event type', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].properties.action.type).toBe('info')
  })

  test('should include payment processed message in event', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].properties.action.message).toBe('Payment request processed')
  })

  test('should include payment request in event', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0][0].properties.action.data).toEqual(paymentRequests[0])
  })

  test('should include event for each payment request', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockSendEvents.mock.calls[0][0].length).toBe(2)
  })
})

describe('V2 submission events', () => {
  test('should send V2 event if V2 events enabled', async () => {
    config.useV2Events = true
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents).toHaveBeenCalled()
  })

  test('should not send V2 event if V2 events disabled', async () => {
    config.useV2Events = false
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents).not.toHaveBeenCalled()
  })

  test('should send event to V2 topic', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(config.eventsTopic)
  })

  test('should raise an event with processing source', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].source).toBe(SOURCE)
  })

  test('should raise acknowledged payment event type', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].type).toBe(PAYMENT_SUBMITTED)
  })

  test('should include payment request in event data', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toEqual(paymentRequest)
  })

  test('should include event for each payment request', async () => {
    await sendSubmissionEvents(paymentRequests)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
