const {
  BPS, CS, FDMR, LumpSums, SFI, SFIP, VetVisits, IMPS, ES,
  SFI23, Delinked, SFIExpanded, SITICOHTC, SITICOHTR
} = require('../../../../app/constants/schemes')
const { getPaymentType } = require('../../../../app/batching/vendor-lines/get-payment-type')

describe('get payment type', () => {
  test.each([
    { scheme: CS, paymentType: '1', expected: 1 },
    { scheme: CS, paymentType: '0', expected: 0 },
    { scheme: CS, paymentType: '2', expected: 0 },
    { scheme: BPS, paymentType: undefined, expected: '' },
    { scheme: BPS, paymentType: '0', expected: '' },
    { scheme: FDMR, paymentType: undefined, expected: '' },
    { scheme: FDMR, paymentType: '0', expected: '' },
    { scheme: LumpSums, paymentType: '0', expected: 0 },
    { scheme: SFI, paymentType: '0', expected: 0 },
    { scheme: SFIP, paymentType: '0', expected: 0 },
    { scheme: VetVisits, paymentType: '0', expected: 0 },
    { scheme: ES, paymentType: undefined, expected: '' },
    { scheme: ES, paymentType: '0', expected: '' },
    { scheme: ES, paymentType: '1', expected: '' },
    { scheme: IMPS, paymentType: undefined, expected: 'No' },
    { scheme: IMPS, paymentType: '0', expected: 'No' },
    { scheme: IMPS, paymentType: '1', expected: 'No' },
    { scheme: SFI23, paymentType: '0', expected: 0 },
    { scheme: Delinked, paymentType: '0', expected: 0 },
    { scheme: SFIExpanded, paymentType: '0', expected: 0 },
    { scheme: SITICOHTR, paymentType: '0', expected: 0 },
    { scheme: SITICOHTC, paymentType: '0', expected: 0 }
  ])('returns $expected for $scheme with paymentType $paymentType', ({ scheme, paymentType, expected }) => {
    expect(getPaymentType(scheme, paymentType)).toBe(expected)
  })
})
