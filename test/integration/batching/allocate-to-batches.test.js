const allocateToBatch = require('../../../app/batching/allocate-to-batches')
const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const { AP, AR } = require('../../../app/constants/ledgers')
const { SFI, SFI23 } = require('../../../app/constants/pillars')

let scheme
let paymentRequest
let invoiceLine
let sequence
let queue

describe('allocate to batch', () => {
  beforeEach(async () => {
    await truncate()

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

    paymentRequest = {
      paymentRequestId: 1,
      schemeId: 1,
      frn: 1234567890,
      marketingYear: 2022,
      ledger: AP
    }

    invoiceLine = {
      invoiceLineId: 1,
      paymentRequestId: 1
    }

    sequence = {
      schemeId: 1,
      nextAP: 5,
      nextAR: 3
    }

    queue = {
      paymentRequestId: 1
    }
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('should not increase sequence if no due payment requests', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(5)
    expect(sequenceResult.nextAR).toBe(3)
  })

  test('should not increase sequence for AP payment requests with no invoice lines', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(5)
    expect(sequenceResult.nextAR).toBe(3)
  })

  test('should not increase sequence for AR payment requests with no invoice lines', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(5)
    expect(sequenceResult.nextAR).toBe(3)
  })

  test('should not allocate AP payment requests with no invoice lines', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.queue().insert(queue)
    await allocateToBatch()
    const completedPaymentRequest = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(completedPaymentRequest.batchId).toBeUndefined()
  })

  test('should not allocate AR payment requests with no invoice lines', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.queue().insert(queue)
    await allocateToBatch()
    const completedPaymentRequest = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(completedPaymentRequest.batchId).toBeUndefined()
  })

  test('should create AP batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AP, sequence: sequence.nextAP })
    expect(batches.length).toBe(1)
  })

  test('should allocate AP payment requests to next batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const completedPaymentRequest = await db.paymentRequest().where({ paymentRequestId: sequence.schemeId }).first()
    const batch = await db.batch().where({ ledger: AP, sequence: sequence.nextAP }).first()
    expect(completedPaymentRequest.batchId).toBe(batch.batchId)
  })

  test('should create AR batch', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AR, sequence: sequence.nextAR })
    expect(batches.length).toBe(1)
  })

  test('should allocate AR payment requests to next batch', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const completedPaymentRequest = await db.paymentRequest().where({ paymentRequestId: sequence.schemeId }).first()
    const batch = await db.batch().where({ ledger: AR, sequence: sequence.nextAR }).first()
    expect(completedPaymentRequest.batchId).toBe(batch.batchId)
  })

  test('should increase sequence for AP payment requests', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(6)
    expect(sequenceResult.nextAR).toBe(3)
  })

  test('should increase sequence for AR payment requests', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(5)
    expect(sequenceResult.nextAR).toBe(4)
  })

  test('should set initial dates for AP batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const batch = await db.batch().where({ ledger: AP, sequence: sequence.nextAP }).first()
    expect(batch.created).toBeDefined()
    expect(batch.started).toBeNull()
    expect(batch.published).toBeNull()
  })

  test('should set initial dates for AR batch', async () => {
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const batch = await db.batch().where({ ledger: AR, sequence: sequence.nextAR }).first()
    expect(batch.created).toBeDefined()
    expect(batch.started).toBeNull()
    expect(batch.published).toBeNull()
  })

  test('should reset sequence for AP payment requests to 1 after 9999', async () => {
    sequence.nextAP = 9999
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAP).toBe(1)
  })

  test('should increase sequence for AR payment requests to 1 after 9999', async () => {
    sequence.nextAR = 9999
    paymentRequest.ledger = AR
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(sequenceResult.nextAR).toBe(1)
  })

  test('should not include non existent and existent pillars in same batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    paymentRequest.pillar = SFI
    paymentRequest.paymentRequestId = 2
    invoiceLine.paymentRequestId = 2
    invoiceLine.invoiceLineId = 2
    queue.paymentRequestId = 2
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AP })
    expect(batches.length).toBe(2)
  })

  test('should not include different pillars in same batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    paymentRequest.pillar = SFI23
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    paymentRequest.pillar = SFI
    paymentRequest.paymentRequestId = 2
    invoiceLine.paymentRequestId = 2
    invoiceLine.invoiceLineId = 2
    queue.paymentRequestId = 2
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AP })
    expect(batches.length).toBe(2)
  })

  test('should include same pillar in same batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    paymentRequest.pillar = SFI
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    paymentRequest.paymentRequestId = 2
    invoiceLine.paymentRequestId = 2
    invoiceLine.invoiceLineId = 2
    queue.paymentRequestId = 2
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AP, sequence: sequence.nextAP })
    expect(batches.length).toBe(1)
  })

  test('should include empty pillars in same batch', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    paymentRequest.paymentRequestId = 2
    invoiceLine.paymentRequestId = 2
    invoiceLine.invoiceLineId = 2
    queue.paymentRequestId = 2
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    await allocateToBatch()
    const batches = await db.batch().where({ ledger: AP, sequence: sequence.nextAP })
    expect(batches.length).toBe(1)
  })

  test('should update queue after allocation', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)
    await allocateToBatch()
    const completedQueue = await db.queue().where({ paymentRequestId: paymentRequest.paymentRequestId }).first()
    const batch = await db.batch().where({ ledger: AP, sequence: sequence.nextAP }).first()
    expect(completedQueue.batchId).toBe(batch.batchId)
  })

  test('should skip queue rows locked by another transaction', async () => {
    await db.scheme().insert(scheme)
    await db.sequence().insert(sequence)
    await db.paymentRequest().insert(paymentRequest)
    await db.invoiceLine().insert(invoiceLine)
    await db.queue().insert(queue)

    const lockingTransaction = await db.transaction()
    try {
      await db.queue(lockingTransaction).where({ paymentRequestId: paymentRequest.paymentRequestId }).forUpdate()
      await allocateToBatch()
    } finally {
      await lockingTransaction.rollback()
    }

    const lockedQueue = await db.queue().where({ paymentRequestId: paymentRequest.paymentRequestId }).first()
    const sequenceResult = await db.sequence().where({ schemeId: sequence.schemeId }).first()
    expect(lockedQueue.batchId).toBeNull()
    expect(sequenceResult.nextAP).toBe(5)

    await allocateToBatch()

    const allocatedQueue = await db.queue().where({ paymentRequestId: paymentRequest.paymentRequestId }).first()
    expect(allocatedQueue.batchId).not.toBeNull()
  })
})
