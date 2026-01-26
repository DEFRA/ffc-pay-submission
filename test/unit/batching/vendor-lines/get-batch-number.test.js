const { ES, SFI, FC, IMPS } = require('../../../../app/constants/schemes')
const { getBatchNumber } = require('../../../../app/batching/vendor-lines/get-batch-number')

describe('get batch number', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('returns empty string for ES', () => {
    expect(getBatchNumber(ES, 1)).toBe('')
  })

  test.each([
    { sequence: 1, expected: '0001' },
    { sequence: 10, expected: '0010' },
    { sequence: 100, expected: '0100' },
    { sequence: 1000, expected: '1000' }
  ])('pads sequence number for SFI: $sequence -> $expected', ({ sequence, expected }) => {
    expect(getBatchNumber(SFI, sequence)).toBe(expected)
  })

  const cases = [
    { scheme: FC, batchName: 'FCAP_2023_001.dat', expected: '2023' },
    { scheme: IMPS, batchName: 'FIN_IMPS_AP_123.INT', expected: '123' },
    { scheme: FC, batchName: 'INVALID_BATCH_NAME.dat', expected: '0001' },
    { scheme: IMPS, batchName: 'INVALID_BATCH_NAME.INT', expected: '0001' }
  ]

  test.each(cases)('returns correct batch number for $scheme with batch "$batchName"', ({ scheme, batchName, expected }) => {
    expect(getBatchNumber(scheme, 1, batchName)).toBe(expected)
  })

  test('extracts year from FC batch name with leading zeros', () => {
    expect(getBatchNumber(FC, 1, 'FCAP_0001_001.dat')).toBe('0001')
  })

  test('extracts batch number from IMPS with R variant', () => {
    expect(getBatchNumber(IMPS, 1, 'FIN_IMPS_AR_456.INT')).toBe('456')
  })

  test('handles IMPS batch name with no digits in capture group', () => {
    expect(getBatchNumber(IMPS, 5, 'FIN_IMPS_AP_.INT')).toBe('0005')
  })

  test('pads sequence when it exceeds 4 digits', () => {
    expect(getBatchNumber(SFI, 10000)).toBe('10000')
    expect(getBatchNumber(SFI, 99999)).toBe('99999')
  })
})
