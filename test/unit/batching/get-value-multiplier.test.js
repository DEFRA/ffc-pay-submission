const { getValueMultiplier } = require('../../../app/batching/get-value-multiplier')

describe('getValueMultiplier', () => {
  test('should return 1 when providesAccountingValues is true', () => {
    const result = getValueMultiplier(true)
    expect(result).toBe(1)
  })

  test('should return -1 when providesAccountingValues is false', () => {
    const result = getValueMultiplier(false)
    expect(result).toBe(-1)
  })

  test('should return -1 when providesAccountingValues is undefined', () => {
    const result = getValueMultiplier(undefined)
    expect(result).toBe(-1)
  })

  test('should return -1 when providesAccountingValues is null', () => {
    const result = getValueMultiplier(null)
    expect(result).toBe(-1)
  })
})
