const mockSendMessage = jest.fn()
jest.mock('ffc-messaging', () => {
  return {
    MessageSender: jest.fn().mockImplementation(() => {
      return {
        sendMessage: mockSendMessage,
        closeConnection: jest.fn()
      }
    })
  }
})
jest.mock('ffc-pay-event-publisher', () => {
  return {
    PublishEvent: jest.fn().mockImplementation(() => {
      return {
        sendEvent: jest.fn()
      }
    }),
    PublishEventBatch: jest.fn().mockImplementation(() => {
      return {
        sendEvents: jest.fn()
      }
    }),
    EventPublisher: jest.fn().mockImplementation(() => {
      return {
        publishEvents: jest.fn(),
        publishEvent: jest.fn()
      }
    })
  }
})

const db = require('../../../app/data')

const { AP } = require('../../../app/constants/ledgers')

const generateBatches = require('../../../app/batching/generate-batches')

let scheme
let batch
let paymentRequest
let invoiceLine
let batchProperties

describe('generate batches', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

    batchProperties = {
      schemeId: 1,
      prefix: 'PFELM',
      suffix: ' (SITI)',
      source: 'SitiELM'
    }

    batch = {
      batchId: 1,
      schemeId: 1,
      ledger: AP,
      sequence: 1,
      created: new Date()
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: 1,
      frn: 1234567890,
      marketingYear: 2022,
      ledger: AP,
      batchId: 1
    }

    invoiceLine = {
      invoiceLineId: 1,
      paymentRequestId: 1,
      description: 'Description'
    }
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should generate batch and update as published', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)
    await generateBatches()
    const batchResult = await db.batch.findByPk(batch.batchId)
    expect(batchResult.published).not.toBeNull()
  })

  test('should send message for file transfer', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)
    await generateBatches()
    expect(mockSendMessage.mock.calls[0][0].body.ledger).toBe(AP)
    expect(mockSendMessage.mock.calls[0][0].body.filename).toBeDefined()
  })
})
