const db = require('../../../app/data')
const getFilename = require('../../../app/batching/get-filename')
const { AP, AR } = require('../../../app/constants/ledgers')
const { MANUAL } = require('../../../app/constants/schemes')
const { SFI } = require('../../../app/constants/pillars')

let batch
let pillar

describe('get filename', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    batch = {
      ledger: AP,
      sequence: 1,
      started: new Date(2022, 2, 1, 22, 27, 0, 0),
      scheme: {
        batchProperties: {
          prefix: 'PFELM',
          suffix: ' (SITI)'
        }
      }
    }
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should return filename for sequence 1', async () => {
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return filename for sequence 10', async () => {
    batch.sequence = 10
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0010_AP_\d{14} \(SITI\).csv/)
  })

  test('should return filename for AR', async () => {
    batch.ledger = AR
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AR_\d{14} \(SITI\).csv/)
  })

  test('should return default manual filename if pillar is undefined', async () => {
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return default manual filename if pillar is null', async () => {
    pillar = null
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return default manual filename if pillar is empty string', async () => {
    pillar = ''
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return default manual filename if pillar does not have own source', async () => {
    pillar = 'Something'
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should override manual filename if pillar has own source', async () => {
    pillar = SFI
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPMAN_SFI_0001_AP_\d{14} \(PMAN_SFI\).csv/)
  })
})
