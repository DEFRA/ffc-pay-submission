const { BPS, CS, FDMR, LumpSums, SFI, SFIP, VetVisits, IMPS, ES } = require('../../../../app/constants/schemes')
const { getPaymentType } = require('../../../../app/batching/vendor-lines/get-payment-type')

describe('get payment type tests', () => {
  let paymentType

  test('return 1 when schemeId is CS and paymentType is 1', () => {
    paymentType = '1'
    const result = getPaymentType(CS, paymentType)
    expect(result).toBe(1)
  })

  test('return 0 when schemeId is CS and paymentType is 0', () => {
    paymentType = '0'
    const result = getPaymentType(CS, paymentType)
    expect(result).toBe(0)
  })

  test('return 0 when schemeId is CS and paymentType is 2', () => {
    paymentType = '0'
    const result = getPaymentType(CS, paymentType)
    expect(result).toBe(0)
  })

  test('return "" when schemeId is BPS and paymentType is undefined', () => {
    paymentType = undefined
    const result = getPaymentType(BPS, paymentType)
    expect(result).toBe('')
  })

  test('return "" when schemeId is BPS and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(BPS, paymentType)
    expect(result).toBe('')
  })

  test('return "" when schemeId is FDMR and paymentType is undefined', () => {
    paymentType = undefined
    const result = getPaymentType(FDMR, paymentType)
    expect(result).toBe('')
  })

  test('return "" when schemeId is FDMR and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(FDMR, paymentType)
    expect(result).toBe('')
  })

  test('return 0 when schemeId is LumpSums and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(LumpSums, paymentType)
    expect(result).toBe(0)
  })

  test('return 0 when schemeId is SFI and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(SFI, paymentType)
    expect(result).toBe(0)
  })

  test('return 0 when schemeId is SFIP and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(SFIP, paymentType)
    expect(result).toBe(0)
  })

  test('return 0 when schemeId is VetVisits and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(VetVisits, paymentType)
    expect(result).toBe(0)
  })

  test('return "" when schemeId is ES and paymentType is "0"', () => {
    paymentType = '0'
    const result = getPaymentType(ES, paymentType)
    expect(result).toBe('')
  })

  test('return "" when schemeId is ES and paymentType is "1"', () => {
    paymentType = '1'
    const result = getPaymentType(ES, paymentType)
    expect(result).toBe('')
  })

  test('return "" when schemeId is ES and paymentType is undefined', () => {
    paymentType = undefined
    const result = getPaymentType(ES, paymentType)
    expect(result).toBe('')
  })

  test('return No when schemeId is IMPS and paymentType is "0" ', () => {
    paymentType = '0'
    const result = getPaymentType(IMPS, paymentType)
    expect(result).toBe('No')
  })

  test('return No when schemeId is IMPS and paymentType is "1" ', () => {
    paymentType = '1'
    const result = getPaymentType(IMPS, paymentType)
    expect(result).toBe('No')
  })

  test('return No when schemeId is IMPS and paymentType is undefined ', () => {
    paymentType = undefined
    const result = getPaymentType(IMPS, paymentType)
    expect(result).toBe('No')
  })
})
