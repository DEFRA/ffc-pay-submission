jest.mock('ffc-pay-schemes', () => ({
  getSchemes: jest.fn(),
  getSchemeBatchProperties: jest.fn()
}))

jest.mock('../../app/data', () => ({
  scheme: {
    findOne: jest.fn(),
    upsert: jest.fn()
  },
  batchProperties: {
    upsert: jest.fn()
  },
  sequence: {
    create: jest.fn()
  }
}))

const {
  getSchemes,
  getSchemeBatchProperties
} = require('ffc-pay-schemes')

const db = require('../../app/data')
const { updateSchemesDatabase } = require('../../app/update-schemes-database')

describe('updateSchemesDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
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

    db.scheme.findOne.mockResolvedValue({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledWith({
      where: { schemeId: 1 }
    })

    expect(db.scheme.upsert).toHaveBeenCalledWith({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })

    expect(getSchemeBatchProperties).toHaveBeenCalledWith(1)

    expect(db.batchProperties.upsert).toHaveBeenCalledWith({
      schemeId: 1,
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    expect(db.sequence.create).not.toHaveBeenCalled()
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

    db.scheme.findOne.mockResolvedValue(null)

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledWith({
      where: { schemeId: 1 }
    })

    expect(db.scheme.upsert).toHaveBeenCalledWith({
      schemeId: 1,
      name: 'Sustainable Farming Incentive'
    })

    expect(db.batchProperties.upsert).toHaveBeenCalledWith({
      schemeId: 1,
      prefix: 'SFI Prefix',
      suffix: 'SFI Suffix',
      source: 'SFI Source'
    })

    expect(db.sequence.create).toHaveBeenCalledWith({
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

    db.scheme.findOne.mockResolvedValue({})

    await updateSchemesDatabase()

    expect(db.scheme.findOne).toHaveBeenCalledTimes(2)
    expect(db.scheme.upsert).toHaveBeenCalledTimes(2)
    expect(db.batchProperties.upsert).toHaveBeenCalledTimes(2)
    expect(getSchemeBatchProperties).toHaveBeenCalledTimes(2)
    expect(db.sequence.create).not.toHaveBeenCalled()
  })
})
