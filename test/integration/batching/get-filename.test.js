const { getSchemeIds, getPillars } = require('ffc-pay-schemes')
const db = require('../../../app/database')
const { truncate } = require('../../helpers/truncate')
const getFilename = require('../../../app/batching/get-filename')
const { AP, AR } = require('../../../app/constants/ledgers')
const config = require('../../../app/config')

const { MANUAL, FPTT } = getSchemeIds()
const { SFI } = getPillars()

let batch
let pillar

describe('get filename', () => {
  beforeEach(async () => {
    await truncate()

    batch = {
      ledger: AP,
      sequence: 1,
      started: new Date(2022, 2, 1, 22, 27, 0, 0),
      scheme: {
        schemeId: null,
        batchProperties: {
          prefix: 'PFELM',
          suffix: ' (SITI)'
        }
      }
    }
    pillar = undefined
    config.useV2FRPSJournals = false
  })

  afterAll(async () => {
    await truncate()
    await db.close()
  })

  test('should return filename for sequence 1', async () => {
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return filename for sequence 10', async () => {
    batch.sequence = 10
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPFELM_0010_AP_\d{14} \(SITI\).csv/)
  })

  test('should return filename for AR ledger', async () => {
    batch.ledger = AR
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPFELM_0001_AR_\d{14} \(SITI\).csv/)
  })

  const fallbackVariants = [undefined, null, '', 'Something']
  fallbackVariants.forEach(value => {
    test(`should return default manual filename if pillar is ${value}`, async () => {
      pillar = value
      batch.scheme.schemeId = MANUAL
      const filename = getFilename(batch, pillar)
      expect(filename).toMatch(/FFCPFELM_0001_AP_\d{14} \(SITI\).csv/)
    })
  })

  test('should override manual filename if pillar has own source', async () => {
    pillar = SFI
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPMAN_SFI_0001_AP_\d{14} \(PMAN_SFI\).csv/)
  })

  test('should return filename with fesCode when fesCode is provided', async () => {
    const fesCode = 'FESC'
    const filename = getFilename(batch, pillar, fesCode)
    expect(filename).toMatch(/FFCFESC_0001_AP_\d{14} \(FESC\).csv/)
  })

  test('should prepend FRPS to leading characters when V2 journals are enabled for FRPS schemes', async () => {
    batch.scheme.schemeId = FPTT
    config.useV2FRPSJournals = true

    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCFRPSPFELM_0001_AP_\d{14} \(SITI\)\.csv/)
  })

  test('should include FRPS leading characters when fesCode is provided for V2 FRPS journals', async () => {
    batch.scheme.schemeId = FPTT
    config.useV2FRPSJournals = true

    const filename = getFilename(batch, pillar, 'FESC')
    expect(filename).toMatch(/FFCFRPSFESC_0001_AP_\d{14} \(FESC\).csv/)
  })
})
