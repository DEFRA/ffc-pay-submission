const { EUR } = require('../../../../app/constants/currency')
const { AR } = require('../../../../app/constants/ledgers')
const { NOT_APPLICABLE } = require('../../../../app/constants/not-applicable')
const { getVendorLineAP, getVendorLineAR } = require('../../../../app/batching/vendor-lines/get-vendor-line')

let paymentRequest
let bpsPaymentRequest
let batch
let highestValueLine
let lowestValueLine
let hasDifferentFundCodes

beforeEach(() => {
  paymentRequest = structuredClone(require('../../../mocks/payment-requests/payment-request'))
  bpsPaymentRequest = structuredClone(require('../../../mocks/payment-requests/bps'))

  batch = {
    scheme: {
      batchProperties: { source: 'SFI' }
    },
    sequence: 1
  }

  highestValueLine = { fundCode: '1234', schemeCode: '5678' }
  lowestValueLine = { fundCode: '1234', schemeCode: '5678' }
  hasDifferentFundCodes = false
})

describe('get AP vendor line', () => {
  const testCases = [
    ['default', () => paymentRequest, 0, 1, () => paymentRequest.currency],
    ['BPS', () => bpsPaymentRequest, '', '', () => EUR]
  ]

  test.each(testCases)(
    'should return correct item 14-16 for %s',
    (_label, getReq, expected14, expected16, getExpected26) => {
      const req = getReq()
      const expected26 = getExpected26()
      const line = getVendorLineAP(req, batch, highestValueLine, hasDifferentFundCodes)
      expect(line[13]).toBe(expected14)
      expect(line[15]).toBe(expected16)
      expect(line[25]).toBe(expected26)
    }
  )

  test('should handle schedule presence for item 29-30', () => {
    let line = getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
    expect(line[28]).toBe(paymentRequest.schedule)
    expect(line[29]).toBe('END')

    paymentRequest.schedule = null
    line = getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
    expect(line[28]).toBe('END')
  })

  test('should use XXXXX for fund code if hasDifferentFundCodes is true', () => {
    hasDifferentFundCodes = true
    const line = getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
    expect(line[3]).toBe('XXXXX')
  })

  test('should return marketing year or NOT_APPLICABLE', () => {
    const line = getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
    expect(line[5]).toBe(paymentRequest.marketingYear)

    delete paymentRequest.marketingYear
    const line2 = getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
    expect(line2[5]).toBe(NOT_APPLICABLE)
  })
})

describe('get AR vendor line', () => {
  beforeEach(() => {
    paymentRequest.ledger = AR
    paymentRequest.originalInvoiceNumber = 'S12345678C123456V001'
  })

  const testCasesAR = [
    ['default', () => paymentRequest, () => '', () => ''],
    ['BPS', () => bpsPaymentRequest, () => bpsPaymentRequest.frn, () => EUR]
  ]

  test.each(testCasesAR)(
    'should return correct item 14-16 for %s',
    (_label, getReq, getExpected14, getExpected16) => {
      const req = getReq()
      const expected14 = getExpected14()
      const expected16 = getExpected16()
      const line = getVendorLineAR(req, batch, lowestValueLine)
      expect(line[13]).toBe(expected14)
      expect(line[15]).toBe(expected16)
    }
  )

  test('should handle marketing year presence for item 20', () => {
    const line = getVendorLineAR(paymentRequest, batch, lowestValueLine)
    expect(line[19]).toBe(paymentRequest.marketingYear)

    paymentRequest.marketingYear = null
    const line2 = getVendorLineAR(paymentRequest, batch, lowestValueLine)
    expect(line2[19]).toBe(NOT_APPLICABLE)
  })
})
