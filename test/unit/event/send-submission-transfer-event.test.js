const mockPublishEvent = jest.fn()

const MockEventPublisher = jest.fn().mockImplementation(() => {
  return {
    publishEvent: mockPublishEvent
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
const { BATCH_CREATED } = require('../../../app/constants/events')

const sendSubmissionTransferEvents = require('../../../app/event/send-submission-transfer-event')

let batch
let filename

describe('V2 submission transfer events', () => {
  beforeEach(() => {
    batch = JSON.parse(JSON.stringify(require('../../mocks/batch')))

    filename = require('../../mocks/filename')

    config.eventsTopic = 'v2-events'
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should send event to V2 topic', async () => {
    await sendSubmissionTransferEvents(filename, batch)
    expect(MockEventPublisher.mock.calls[0][0]).toBe(config.eventsTopic)
  })

  test('should raise an event with processing source', async () => {
    await sendSubmissionTransferEvents(filename, batch)
    expect(mockPublishEvent.mock.calls[0][0].source).toBe(SOURCE)
  })

  test('should raise acknowledged payment event type', async () => {
    await sendSubmissionTransferEvents(filename, batch)
    expect(mockPublishEvent.mock.calls[0][0].type).toBe(BATCH_CREATED)
  })

  test('should raise an event with filename as subject', async () => {
    await sendSubmissionTransferEvents(filename, batch)
    expect(mockPublishEvent.mock.calls[0][0].subject).toBe(filename)
  })

  test('should include filename as subject', async () => {
    await sendSubmissionTransferEvents(filename, batch)
    expect(mockPublishEvent.mock.calls[0][0].subject).toBe(filename)
  })
})
