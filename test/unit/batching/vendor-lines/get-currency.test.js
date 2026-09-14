const { getSchemeIds } = require('ffc-pay-schemes')
const { EUR, GBP } = require('../../../../app/constants/currency')
const { getCurrency } = require('../../../../app/batching/vendor-lines/get-currency')

const { BPS, ES, IMPS, SFI } = getSchemeIds()

describe('get currency', () => {
  test.each([
    { scheme: BPS, input: GBP, expected: EUR },
    { scheme: ES, input: GBP, expected: '' },
    { scheme: IMPS, input: GBP, expected: '' },
    { scheme: SFI, input: GBP, expected: GBP }
  ])('returns $expected for $scheme scheme', ({ scheme, input, expected }) => {
    expect(getCurrency(scheme, input)).toBe(expected)
  })
})
