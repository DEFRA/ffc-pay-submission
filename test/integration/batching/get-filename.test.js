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

  // Sequence tests
  test('should return filename for sequence 1', async () => {
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
  })

  test('should return filename for sequence 10', async () => {
    batch.sequence = 10
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0010_AP_\d{14} \(SITI\).csv/)
  })

  // Ledger tests
  test('should return filename for AR', async () => {
    batch.ledger = AR
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/PFELM_0001_AR_\d{14} \(SITI\).csv/)
  })

  // Manual pillar fallback tests
  const fallbackVariants = [undefined, null, '', 'Something']
  fallbackVariants.forEach(value => {
    test(`should return default manual filename if pillar is ${value}`, async () => {
      pillar = value
      batch.scheme.schemeId = MANUAL
      const filename = getFilename(batch, pillar)
      expect(filename).toMatch(/PFELM_0001_AP_\d{14} \(SITI\).csv/)
    })
  })

  // Manual pillar override
  test('should override manual filename if pillar has own source', async () => {
    pillar = SFI
    batch.scheme.schemeId = MANUAL
    const filename = getFilename(batch, pillar)
    expect(filename).toMatch(/FFCPMAN_SFI_0001_AP_\d{14} \(PMAN_SFI\).csv/)
  })
})
