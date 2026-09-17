const { getSchemeIds } = require('ffc-pay-schemes')
const { BPS, ES, IMPS, SFI } = getSchemeIds()
const { getPaymentDescription } = require('../../../../app/batching/vendor-lines/get-payment-description')

describe('get payment description', () => {
  test.each([
    { scheme: BPS, expected: '' },
    { scheme: ES, expected: '' },
    { scheme: IMPS, expected: 'PAY' },
    { scheme: SFI, expected: '1' }
  ])('returns $expected for $scheme scheme', ({ scheme, expected }) => {
    expect(getPaymentDescription(scheme)).toBe(expected)
  })
})
