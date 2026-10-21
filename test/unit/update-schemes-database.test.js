jest.mock('ffc-pay-schemes', () => ({
  getSchemes: jest.fn(),
  getSchemeBatchProperties: jest.fn()
}))

const { createKnexMock, createQueryBuilder } = require('../helpers/mock-knex')

const mockDb = createKnexMock(['scheme', 'batchProperties', 'sequence'])

jest.mock('../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const {
  getSchemes,
  getSchemeBatchProperties
} = require('ffc-pay-schemes')

const { updateSchemesDatabase } = require('../../app/update-schemes-database')

let schemeLookup
let schemeUpsert
let batchPropertiesUpsert
let sequenceInsert

const mockExistingScheme = (existingScheme) => {
  schemeLookup.resolves(existingScheme)
}

describe('updateSchemesDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation()

    schemeLookup = createQueryBuilder()
    schemeUpsert = createQueryBuilder()
    batchPropertiesUpsert = createQueryBuilder()
    sequenceInsert = createQueryBuilder()

    mockDb.tables.scheme.mockImplementation(() => {
      const calls = mockDb.tables.scheme.mock.calls.length
      return calls % 2 === 1 ? schemeLookup : schemeUpsert
    })
    mockDb.tables.batchProperties.mockReturnValue(batchPropertiesUpsert)
    mockDb.tables.sequence.mockReturnValue(sequenceInsert)
  })

  afterEach(() => {
    console.log.mockRestore()
  })

  test('updates an existing scheme and batch properties without creating a sequence', async () => {
    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Sustainable Farming Incentive' }
    ])

    getSchemeBatchProperties.mockReturnValue({
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    mockExistingScheme({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })

    await updateSchemesDatabase()

    expect(schemeLookup.where).toHaveBeenCalledWith({ schemeId: 1 })
    expect(schemeLookup.first).toHaveBeenCalledTimes(1)

    expect(schemeUpsert.insert).toHaveBeenCalledWith({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })
    expect(schemeUpsert.onConflict).toHaveBeenCalledWith('schemeId')
    expect(schemeUpsert.merge).toHaveBeenCalledTimes(1)

    expect(getSchemeBatchProperties).toHaveBeenCalledWith(1)

    expect(batchPropertiesUpsert.onConflict).toHaveBeenCalledWith('schemeId')
    expect(batchPropertiesUpsert.merge).toHaveBeenCalledTimes(1)
    expect(batchPropertiesUpsert.insert).toHaveBeenCalledWith({
      schemeId: 1,
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    expect(mockDb.tables.sequence).not.toHaveBeenCalled()
  })

  test('creates a sequence for a newly created scheme', async () => {
    getSchemes.mockReturnValue([
      { schemeId: 1, schemeName: 'Sustainable Farming Incentive' }
    ])

    getSchemeBatchProperties.mockReturnValue({
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    mockExistingScheme(undefined)

    await updateSchemesDatabase()

    expect(schemeLookup.where).toHaveBeenCalledWith({ schemeId: 1 })
    expect(schemeLookup.first).toHaveBeenCalledTimes(1)

    expect(schemeUpsert.insert).toHaveBeenCalledWith({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })
    expect(schemeUpsert.onConflict).toHaveBeenCalledWith('schemeId')
    expect(schemeUpsert.merge).toHaveBeenCalledTimes(1)

    expect(batchPropertiesUpsert.onConflict).toHaveBeenCalledWith('schemeId')
    expect(batchPropertiesUpsert.merge).toHaveBeenCalledTimes(1)
    expect(batchPropertiesUpsert.insert).toHaveBeenCalledWith({
      schemeId: 1,
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    expect(sequenceInsert.insert).toHaveBeenCalledWith({
      schemeId: 1,
      nextAP: 1,
      nextAR: 1
    })
  })

  test('processes every supported scheme', async () => {
    getSchemes.mockReturnValue([
      { schemeId: 'SFI', schemeName: 'Sustainable Farming Incentive' },
      { schemeId: 'CS', schemeName: 'Countryside Stewardship' }
    ])

    getSchemeBatchProperties
      .mockReturnValueOnce({
        prefix: 'SFI',
        suffix: 'AP',
        source: 'SOURCE'
      })
      .mockReturnValueOnce({
        prefix: 'CS',
        suffix: 'AR',
        source: 'SOURCE'
      })

    mockExistingScheme({})

    await updateSchemesDatabase()

    expect(schemeLookup.first).toHaveBeenCalledTimes(2)
    expect(schemeUpsert.merge).toHaveBeenCalledTimes(2)
    expect(batchPropertiesUpsert.merge).toHaveBeenCalledTimes(2)
    expect(getSchemeBatchProperties).toHaveBeenCalledTimes(2)
    expect(mockDb.tables.sequence).not.toHaveBeenCalled()
  })
})
