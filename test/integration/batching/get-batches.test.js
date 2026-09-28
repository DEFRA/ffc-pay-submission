const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const getBatches = require('../../../app/batching/get-batches')
const { AP } = require('../../../app/constants/ledgers')

let scheme
let batch
let paymentRequest
let invoiceLine
let batchProperties

const runGetBatches = async () =>
  db.transaction(async (transaction) => {
    return await getBatches(transaction)
  })

describe('get batches', () => {
  beforeEach(async () => {
    await truncate()

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
    await truncate()
    await db.close()
  })

  test('should not return batches if no payment requests', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should not return batches if payment requests have no invoice lines', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should return batch if not complete', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(1)
  })

  test('should update started', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    await runGetBatches()

    const batchResult = await db.batch().where({ batchId: batch.batchId }).first()
    expect(batchResult.started).not.toBeNull()
  })

  test('should throw if called without a transaction', async () => {
    await expect(getBatches()).rejects.toThrow('getBatches must be called with a transaction')
  })

  test('should log and rethrow errors in getBatches', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

    const fakeTransaction = {
      raw: jest.fn(() => { throw new Error('boom') })
    }

    await expect(getBatches(fakeTransaction)).rejects.toThrow('boom')

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error in getBatches:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  test('should rethrow errors from inner functions', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    await expect(db.transaction(async (transaction) => {
      Object.defineProperty(transaction, 'raw', { value: jest.fn(() => { throw new Error('forced failure') }) })
      return getBatches(transaction)
    })).rejects.toThrow('forced failure')
  })

  test('should not return batch started within the last five minutes', async () => {
    batch.started = new Date(Date.now() - 60 * 1000)
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should return batch started more than five minutes ago', async () => {
    batch.started = new Date(Date.now() - 10 * 60 * 1000)
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(1)
  })

  test('should not return published batch', async () => {
    batch.published = new Date()
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should not return batch if scheme has no batch properties', async () => {
    await db.scheme().insert(scheme)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)

    const batches = await runGetBatches()
    expect(batches.length).toBe(0)
  })

  test('should return batch with nested payment requests, invoice lines and scheme', async () => {
    await db.scheme().insert(scheme)
    await db.batchProperties().insert(batchProperties)
    await db.batch().insert(batch)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.invoiceLine().insert({ ...invoiceLine, invoiceLineId: 2 })

    const [result] = await runGetBatches()

    expect(result.batchId).toBe(batch.batchId)
    expect(result.scheme).toMatchObject({ ...scheme, batchProperties })
    expect(result.paymentRequests).toHaveLength(1)
    expect(result.paymentRequests[0].paymentRequestId).toBe(paymentRequest.paymentRequestId)
    expect(result.paymentRequests[0].invoiceLines.map(x => x.invoiceLineId)).toEqual([1, 2])
    expect(result.paymentRequests[0].invoiceLines[0]).not.toHaveProperty('stateAid')
  })
})
