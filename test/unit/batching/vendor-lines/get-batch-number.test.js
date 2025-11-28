const config = require('../../../../app/config')
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

  describe.each([true, false])('when useV2ReturnFiles is %s', (useV2) => {
    beforeEach(() => {
      config.useV2ReturnFiles = useV2
    })

    const cases = [
      { scheme: FC, batchName: 'FCAP_2023_001.dat', expected: useV2 ? '2023' : '0001' },
      { scheme: IMPS, batchName: 'FIN_IMPS_AP_123.INT', expected: useV2 ? '123' : '0001' },
      { scheme: FC, batchName: 'INVALID_BATCH_NAME.dat', expected: '0001' },
      { scheme: IMPS, batchName: 'INVALID_BATCH_NAME.INT', expected: '0001' }
    ]

    test.each(cases)('returns correct batch number for $scheme with batch "$batchName"', ({ scheme, batchName, expected }) => {
      expect(getBatchNumber(scheme, 1, batchName)).toBe(expected)
    })
  })
})
