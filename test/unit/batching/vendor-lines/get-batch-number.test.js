const config = require('../../../../app/config')
const { ES, SFI, FC, IMPS } = require('../../../../app/constants/schemes')
const { getBatchNumber } = require('../../../../app/batching/vendor-lines/get-batch-number')

describe('get batch number', () => {
  beforeEach(() => {
    jest.resetModules()
  })

  test('returns empty string for ES', () => {
    const sequence = 1
    expect(getBatchNumber(ES, sequence)).toBe('')
  })

  test('pads sequence number with leading zeros to four digits if sequence is 1 digit and scheme is not ES', () => {
    const sequence = 1
    expect(getBatchNumber(SFI, sequence)).toBe('0001')
  })

  test('pads sequence number with leading zeros to four digits if sequence is 2 digits and scheme is not ES', () => {
    const sequence = 10
    expect(getBatchNumber(SFI, sequence)).toBe('0010')
  })

  test('pads sequence number with leading zeros to four digits if sequence is 3 digits and scheme is not ES', () => {
    const sequence = 100
    expect(getBatchNumber(SFI, sequence)).toBe('0100')
  })

  test('does not pad sequence number with leading zeros if sequence is 4 digits and scheme is not ES', () => {
    const sequence = 1000
    expect(getBatchNumber(SFI, sequence)).toBe('1000')
  })

  describe('when useV2ReturnFiles is true', () => {
    beforeEach(() => {
      config.useV2ReturnFiles = true
    })

    test('returns batch number from batch name for FC scheme', () => {
      const sequence = 1
      const batchName = 'FCAP_2023_001.dat'
      expect(getBatchNumber(FC, sequence, batchName)).toBe('2023')
    })

    test('returns batch number from batch name for IMPS scheme', () => {
      const sequence = 1
      const batchName = 'FIN_IMPS_AP_123.INT'
      expect(getBatchNumber(IMPS, sequence, batchName)).toBe('123')
    })

    test('returns padded sequence number if batch name does not match pattern for FC scheme', () => {
      const sequence = 1
      const batchName = 'INVALID_BATCH_NAME.dat'
      expect(getBatchNumber(FC, sequence, batchName)).toBe('0001')
    })

    test('returns padded sequence number if batch name does not match pattern for IMPS scheme', () => {
      const sequence = 1
      const batchName = 'INVALID_BATCH_NAME.INT'
      expect(getBatchNumber(IMPS, sequence, batchName)).toBe('0001')
    })
  })

  describe('when useV2ReturnFiles is false', () => {
    beforeEach(() => {
      config.useV2ReturnFiles = false
    })

    test('returns padded sequence number from batch name for FC scheme (should not match)', () => {
      const sequence = 1
      const batchName = 'FCAP_2023_001.dat'
      expect(getBatchNumber(FC, sequence, batchName)).toBe('0001')
    })

    test('returns padded sequence number from batch name for IMPS scheme (should not match)', () => {
      const sequence = 1
      const batchName = 'FIN_IMPS_AP_123.INT'
      expect(getBatchNumber(IMPS, sequence, batchName)).toBe('0001')
    })

    test('returns padded sequence number if batch name does not match pattern for FC scheme', () => {
      const sequence = 1
      const batchName = 'INVALID_BATCH_NAME.dat'
      expect(getBatchNumber(FC, sequence, batchName)).toBe('0001')
    })

    test('returns padded sequence number if batch name does not match pattern for IMPS scheme', () => {
      const sequence = 1
      const batchName = 'INVALID_BATCH_NAME.INT'
      expect(getBatchNumber(IMPS, sequence, batchName)).toBe('0001')
    })
  })
})
