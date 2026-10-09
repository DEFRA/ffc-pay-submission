const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const completeBatch = require('../../../app/batching/complete-batch')
const moment = require('moment')
const { AP } = require('../../../app/constants/ledgers')
let scheme
let batch

describe('complete batch', () => {
  beforeEach(async () => {
    await truncate()

    scheme = {
      schemeId: 1,
      name: 'SFI'
    }

    batch = {
      batchId: 1,
      schemeId: 1,
      ledger: AP,
      created: new Date(),
      started: new Date()
    }
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('should update published date if not already complete', async () => {
    await db.scheme().insert(scheme)
    await db.batch().insert(batch)
    await completeBatch(batch.batchId)
    const batchResult = await db.batch().where({ batchId: batch.batchId }).first()
    expect(batchResult.published).not.toBeNull()
  })

  test('should not update published date if already complete', async () => {
    batch.published = moment().subtract(1, 'day').toDate()
    await db.scheme().insert(scheme)
    await db.batch().insert(batch)
    await completeBatch(batch.batchId)
    const batchResult = await db.batch().where({ batchId: batch.batchId }).first()
    expect(batchResult.published).toStrictEqual(batch.published)
  })
})
