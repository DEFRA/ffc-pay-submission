const { getValueMultiplier } = require('../../../app/batching/get-value-multiplier')
const { FPTT } = require('../../../app/constants/schemes')

describe('getValueMultiplier', () => {
  test('should return 1 when schemeId is FPTT', () => {
    const result = getValueMultiplier(FPTT)
    expect(result).toBe(1)
  })

  test('should return -1 when schemeId is not FPTT', () => {
    const result = getValueMultiplier('someOtherScheme')
    expect(result).toBe(-1)
  })

  test('should return -1 when schemeId is undefined', () => {
    const result = getValueMultiplier(undefined)
    expect(result).toBe(-1)
  })

  test('should return -1 when schemeId is null', () => {
    const result = getValueMultiplier(null)
    expect(result).toBe(-1)
  })

  test('should return -1 when schemeId is an empty string', () => {
    const result = getValueMultiplier('')
    expect(result).toBe(-1)
  })
})
