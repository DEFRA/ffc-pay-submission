const db = require('../../../app/data')
const completeBatch = require('../../../app/batching/complete-batch')
const moment = require('moment')
const { AP } = require('../../../app/constants/ledgers')
let scheme
let batch

describe('complete batch', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

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
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should update published date if not already complete', async () => {
    await db.scheme.create(scheme)
    await db.batch.create(batch)
    await completeBatch(batch.batchId)
    const batchResult = await db.batch.findByPk(batch.batchId)
    expect(batchResult.published).not.toBeNull()
  })

  test('should not update published date if already complete', async () => {
    batch.published = moment().subtract(1, 'day')
    await db.scheme.create(scheme)
    await db.batch.create(batch)
    await completeBatch(batch.batchId)
    const batchResult = await db.batch.findByPk(batch.batchId)
    expect(batchResult.published).toStrictEqual(batch.published.toDate())
  })
})
