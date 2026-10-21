const { getSchemes, getSchemeBatchProperties } = require('ffc-pay-schemes')
const db = require('../../app/database')
const { truncate } = require('../helpers/truncate')
const { updateSchemesDatabase } = require('../../app/update-schemes-database')

describe('update schemes database', () => {
  beforeEach(async () => {
    jest.spyOn(console, 'log').mockImplementation()
    await truncate()
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('creates every supported scheme with batch properties and sequences', async () => {
    await updateSchemesDatabase()

    const schemes = getSchemes()
    expect(await db.scheme()).toHaveLength(schemes.length)
    expect(await db.batchProperties()).toHaveLength(schemes.length)
    expect(await db.sequence()).toHaveLength(schemes.length)
  })

  test('updates existing scheme and batch properties without resetting sequences', async () => {
    const [{ schemeId, schemeName }] = getSchemes()
    await db.scheme().insert({ schemeId, name: 'Old' })
    await db.batchProperties().insert({ schemeId, prefix: 'OLD', suffix: 'OLD', source: 'OLD' })
    await db.sequence().insert({ schemeId, nextAP: 5, nextAR: 7 })

    await updateSchemesDatabase()

    const { prefix, suffix, source } = getSchemeBatchProperties(schemeId)
    expect(await db.scheme().where({ schemeId }).first()).toEqual({ schemeId, name: schemeName })
    expect(await db.batchProperties().where({ schemeId }).first()).toEqual({ schemeId, prefix, suffix, source })
    expect(await db.sequence().where({ schemeId }).first()).toEqual({ schemeId, nextAP: 5, nextAR: 7 })
  })
})
