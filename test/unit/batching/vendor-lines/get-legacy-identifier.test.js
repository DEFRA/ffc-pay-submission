const { getSchemeIds } = require('ffc-pay-schemes')
const { SFI, BPS } = getSchemeIds()

const { getLegacyIdentifier } = require('../../../../app/batching/vendor-lines/get-legacy-identifier')
const { FRN } = require('../../../mocks/values/frn')

describe('get legacy identifier', () => {
  test('returns contract number for schemes other than BPS', () => {
    expect(getLegacyIdentifier(SFI, FRN)).toBe('')
  })

  test('returns FRN for BPS', () => {
    expect(getLegacyIdentifier(BPS, FRN)).toBe(FRN)
  })
})
