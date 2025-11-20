const { getDescription } = require('../../../../app/batching/ledger-lines/get-description')
const { BPS, FDMR } = require('../../../../app/constants/schemes')

const schemesWithSubstring = [BPS, FDMR]
const otherScheme = 'OTHER'
const MAX_DESCRIPTION_LENGTH = 60

describe('getDescription', () => {
  test.each(schemesWithSubstring)('should return substring from index 6 for %s scheme', (scheme) => {
    const description = '1234567890'
    expect(getDescription(scheme, description)).toBe('7890')
  })

  test('should return substring up to MAX_DESCRIPTION_LENGTH for other schemes', () => {
    const description = '1234567890123456789012345678901234567890123456789012345678901234567890'
    expect(getDescription(otherScheme, description)).toBe(description.substring(0, MAX_DESCRIPTION_LENGTH))
  })

  test.each(schemesWithSubstring)('should handle euro symbol correctly for %s scheme', (scheme) => {
    const description = '123456€7890'
    expect(getDescription(scheme, description)).toBe('EUR7890')
  })

  test('should handle euro symbol correctly for other schemes', () => {
    const description = '€1234567890123456789012345678901234567890123456789012345678901234567890'
    const expected = 'EUR1234567890123456789012345678901234567890123456789012345678901234567890'.substring(0, MAX_DESCRIPTION_LENGTH)
    expect(getDescription(otherScheme, description)).toBe(expected)
  })
})
