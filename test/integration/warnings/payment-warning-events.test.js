const { randomUUID } = require('node:crypto')

const mockPublishedEvents = []

jest.mock('ffc-pay-event-publisher', () => ({
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvent: jest.fn(async (event) => { mockPublishedEvents.push(event) }),
    publishEvents: jest.fn(async (events) => { mockPublishedEvents.push(...events) })
  }))
}))

const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const processPaymentMessage = require('../../../app/messaging/process-payment-message')
const { DUPLICATE_PAYMENT_WARNING, PAYMENT_PROCESSING_FAILED } = require('../../../app/constants/events')
const { isEventHubPaymentEvent } = require('../../helpers/is-event-hub-payment-event')

let paymentRequest
let receiver

const getPublishedEvent = (type) => mockPublishedEvents.find(event => event.type === type)

const expectPaymentIdentifiers = (event) => {
  expect(event.data.frn).toBe(paymentRequest.frn)
  expect(event.data.correlationId).toBe(paymentRequest.correlationId)
  expect(event.data.schemeId).toBe(paymentRequest.schemeId)
  expect(event.data.invoiceNumber).toBe(paymentRequest.invoiceNumber)
}

const countPaymentRequests = async () => {
  const [{ count }] = await db.paymentRequest().count({ count: '*' })
  return Number(count)
}

describe('payment warning events', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    mockPublishedEvents.length = 0

    await truncate()

    paymentRequest = {
      ...structuredClone(require('../../mocks/payment-requests/payment-request')),
      referenceId: randomUUID()
    }
    receiver = {
      completeMessage: jest.fn()
    }

    await db.scheme().insert({ schemeId: paymentRequest.schemeId, name: 'SFI' })
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  describe('duplicate payment request', () => {
    beforeEach(async () => {
      await processPaymentMessage({ body: structuredClone(paymentRequest) }, receiver)
      mockPublishedEvents.length = 0
      await processPaymentMessage({ body: structuredClone(paymentRequest) }, receiver)
    })

    test('should publish duplicate payment warning with payment identifiers', () => {
      const event = getPublishedEvent(DUPLICATE_PAYMENT_WARNING)
      expect(event).toBeDefined()
      expectPaymentIdentifiers(event)
    })

    test('should publish duplicate payment warning event hub can save against payment', () => {
      expect(isEventHubPaymentEvent(getPublishedEvent(DUPLICATE_PAYMENT_WARNING))).toBe(true)
    })

    test('should only publish one event for duplicate', () => {
      expect(mockPublishedEvents).toHaveLength(1)
    })

    test('should only save payment request once', async () => {
      expect(await countPaymentRequests()).toBe(1)
    })
  })

  describe('payment request fails processing', () => {
    beforeEach(async () => {
      delete paymentRequest.invoiceLines
      await processPaymentMessage({ body: paymentRequest }, receiver)
    })

    test('should publish processing failed warning with payment identifiers', () => {
      const event = getPublishedEvent(PAYMENT_PROCESSING_FAILED)
      expect(event).toBeDefined()
      expectPaymentIdentifiers(event)
    })

    test('should publish processing failed warning event hub can save against payment', () => {
      expect(isEventHubPaymentEvent(getPublishedEvent(PAYMENT_PROCESSING_FAILED))).toBe(true)
    })

    test('should not complete message', () => {
      expect(receiver.completeMessage).not.toHaveBeenCalled()
    })

    test('should not save payment request', async () => {
      expect(await countPaymentRequests()).toBe(0)
    })
  })
})
