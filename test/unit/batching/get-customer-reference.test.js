const { ES, FC, IMPS } = require('../../../app/constants/schemes')

const { getCustomerReference } = require('../../../app/batching/get-customer-reference')

let paymentRequest

describe('get customer reference', () => {
  beforeEach(() => {
    paymentRequest = structuredClone(require('../../mocks/payment-requests/payment-request'))
  })

  test('returns vendor for ES', () => {
    paymentRequest.schemeId = ES
    expect(getCustomerReference(paymentRequest)).toBe(paymentRequest.vendor)
  })

  test('returns sbi for FC', () => {
    paymentRequest.schemeId = FC
    expect(getCustomerReference(paymentRequest)).toBe(paymentRequest.sbi)
  })

  test('returns trader for IMPS', () => {
    paymentRequest.schemeId = IMPS
    expect(getCustomerReference(paymentRequest)).toBe(paymentRequest.trader)
  })

  test('returns legacy for other schemes', () => {
    expect(getCustomerReference(paymentRequest)).toBe('legacy')
  })
})
