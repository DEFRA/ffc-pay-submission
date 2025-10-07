const mockPublishEvents = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvents: mockPublishEvents
  }
})

jest.mock('ffc-pay-event-publisher', () => {
  return {
    EventPublisher: MockEventPublisher
  }
})

jest.mock('../../../app/config')
const config = require('../../../app/config')

const { SOURCE } = require('../../../app/constants/source')
const { PAYMENT_SUBMITTED } = require('../../../app/constants/events')

const sendSubmissionEvents = require('../../../app/event/send-submission-batch-event')

let batch
let paymentRequest
let filename

describe('V2 submission events', () => {
  beforeEach(() => {
    paymentRequest = JSON.parse(JSON.stringify(require('../../mocks/payment-requests/payment-request')))
    batch = JSON.parse(JSON.stringify(require('../../mocks/batch')))

    filename = require('../../mocks/filename')

    config.eventsTopic = 'v2-events'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send event to V2 topic', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(config.eventsTopic)
  })

  test('should raise an event with processing source', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(mockPublishEvents.mock.calls[0][0][0].source).toBe(SOURCE)
  })

  test('should raise acknowledged payment event type', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(mockPublishEvents.mock.calls[0][0][0].type).toBe(PAYMENT_SUBMITTED)
  })

  test('should raise an event with filename as subject', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(mockPublishEvents.mock.calls[0][0][0].subject).toBe(filename)
  })

  test('should include payment request in event data', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(mockPublishEvents.mock.calls[0][0][0].data).toEqual(paymentRequest)
  })

  test('should include event for each payment request', async () => {
    await sendSubmissionEvents(batch, filename)
    expect(mockPublishEvents.mock.calls[0][0].length).toBe(2)
  })
})
