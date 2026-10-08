jest.mock('../../../app/messaging/send-file-transfer-message', () => jest.fn())

jest.mock('ffc-pay-event-publisher', () => ({
  PublishEvent: jest.fn().mockImplementation(() => ({
    sendEvent: jest.fn()
  })),
  PublishEventBatch: jest.fn().mockImplementation(() => ({
    sendEvents: jest.fn()
  })),
  EventPublisher: jest.fn().mockImplementation(() => ({
    publishEvents: jest.fn(),
    publishEvent: jest.fn()
  }))
}))

const db = require('../../../app/data')
const { AP } = require('../../../app/constants/ledgers')
const sendFileTransferMessage = require('../../../app/messaging/send-file-transfer-message')
const generateBatches = require('../../../app/batching/generate-batches')

let scheme
let batch
let paymentRequest
let invoiceLine
let batchProperties

describe('generate batches', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    await db.sequelize.truncate({ cascade: true })

    scheme = { schemeId: 1, name: 'SFI' }

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

  const setup = async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)
    await generateBatches()
  }

  test('publishes batch', async () => {
    await setup()

    const result = await db.batch.findByPk(batch.batchId)
    expect(result.published).not.toBeNull()
  })

  test('sends file-transfer message', async () => {
    await setup()

    expect(sendFileTransferMessage).toHaveBeenCalledTimes(1)
    const [filename, batch] = sendFileTransferMessage.mock.calls[0]
    expect(filename).toBeDefined()
    expect(batch.ledger).toBe(AP)
  })
})
