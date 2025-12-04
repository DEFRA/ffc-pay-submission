const db = require('../../../app/data')
const getBatches = require('../../../app/batching/get-batches')
const config = require('../../../app/config')
const { AP } = require('../../../app/constants/ledgers')

let scheme
let batch
let paymentRequest
let invoiceLine
let batchProperties

const runGetBatches = async () =>
  db.sequelize.transaction(async (transaction) => {
    return await getBatches(transaction)
  }
  )

describe('get batches', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = { schemeId: 1, name: 'SFI' }

    batchProperties = {
      schemeId: 1,
      prefix: 'PFELM',
      suffix: ' (SITI)'
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
      paymentRequestId: 1
    }
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should not return batches if no payment requests', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should not return batches if payment requests have no invoice lines', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should return batch if not complete', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(1)
  })

  test('should update started', async () => {
    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)

    await runGetBatches()

    const batchResult = await db.batch.findByPk(batch.batchId)
    expect(batchResult.started).not.toBeNull()
  })

  test('should restrict batches to cap', async () => {
    const originalCap = config.batchCap
    config.batchCap = 1

    await db.scheme.create(scheme)
    await db.batchProperties.create(batchProperties)
    await db.batch.create(batch)
    await db.paymentRequest.create(paymentRequest)
    await db.invoiceLine.create(invoiceLine)

    await db.batch.create({ ...batch, batchId: 2, sequence: 2 })
    await db.paymentRequest.create({ ...paymentRequest, paymentRequestId: 2, batchId: 2 })
    await db.invoiceLine.create({ ...invoiceLine, invoiceLineId: 2, paymentRequestId: 2 })

    const batches = await runGetBatches()
    expect(batches.length).toBe(1)

    config.batchCap = originalCap
  })
})
