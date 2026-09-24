const { getSchemeIds } = require('ffc-pay-schemes')
const {
  BPS, CS, LUMP_SUMS, SFI, SFI_PILOT, VET_VISITS, IMPS, ES,
  SFI23, DELINKED, SFI_EXPANDED, COHT_CAPITAL, COHT_REVENUE, FPTT, WMP, SFI26
} = getSchemeIds()
const { getPaymentType } = require('../../../../app/batching/vendor-lines/get-payment-type')

describe('get payment type', () => {
  test.each([
    { scheme: CS, paymentType: '1', expected: '1' },
    { scheme: CS, paymentType: '0', expected: '0' },
    { scheme: CS, paymentType: '2', expected: '0' },
    { scheme: BPS, paymentType: undefined, expected: '' },
    { scheme: BPS, paymentType: '0', expected: '' },
    { scheme: LUMP_SUMS, paymentType: '0', expected: '0' },
    { scheme: SFI, paymentType: '0', expected: '0' },
    { scheme: SFI_PILOT, paymentType: '0', expected: '0' },
    { scheme: VET_VISITS, paymentType: '0', expected: '0' },
    { scheme: ES, paymentType: undefined, expected: '' },
    { scheme: ES, paymentType: '0', expected: '' },
    { scheme: ES, paymentType: '1', expected: '' },
    { scheme: IMPS, paymentType: undefined, expected: 'No' },
    { scheme: IMPS, paymentType: '0', expected: 'No' },
    { scheme: IMPS, paymentType: '1', expected: 'No' },
    { scheme: SFI23, paymentType: '0', expected: '0' },
    { scheme: DELINKED, paymentType: '0', expected: '0' },
    { scheme: SFI_EXPANDED, paymentType: '0', expected: '0' },
    { scheme: COHT_REVENUE, paymentType: '0', expected: '0' },
    { scheme: COHT_CAPITAL, paymentType: '0', expected: '0' },
    { scheme: FPTT, paymentType: '0', expected: '0' },
    { scheme: WMP, paymentType: '0', expected: '0' },
    { scheme: SFI26, paymentType: '0', expected: '0' }
  ])('returns $expected for $scheme with paymentType $paymentType', ({ scheme, paymentType, expected }) => {
    expect(getPaymentType(scheme, paymentType)).toBe(expected)
  })
})
