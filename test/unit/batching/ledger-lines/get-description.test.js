const { getDescription } = require('../../../../app/batching/ledger-lines/get-description')
const { BPS, FDMR } = require('../../../../app/constants/schemes')

describe('getDescription', () => {
  test('should return substring from index 6 for BPS scheme', () => {
    const description = '1234567890'
    const result = getDescription(BPS, description)
    expect(result).toBe('7890')
  })

  test('should return substring from index 6 for FDMR scheme', () => {
    const description = '1234567890'
    const result = getDescription(FDMR, description)
    expect(result).toBe('7890')
  })

  test('should return substring up to MAX_DESCRIPTION_LENGTH for other schemes', () => {
    const description = '1234567890123456789012345678901234567890123456789012345678901234567890'
    const result = getDescription('OTHER', description)
    expect(result).toBe(description.substring(0, 60))
  })

  test('should handle euro symbol correctly for BPS scheme', () => {
    const description = '123456€7890'
    const result = getDescription(BPS, description)
    expect(result).toBe('EUR7890')
  })

  test('should handle euro symbol correctly for FDMR scheme', () => {
    const description = '123456€7890'
    const result = getDescription(FDMR, description)
    expect(result).toBe('EUR7890')
  })

  test('should handle euro symbol correctly for other schemes', () => {
    const description = '€1234567890123456789012345678901234567890123456789012345678901234567890'
    const euredDescription = 'EUR1234567890123456789012345678901234567890123456789012345678901234567890'
    const result = getDescription('OTHER', description)
    expect(result).toBe(euredDescription.substring(0, 60))
  })
})
