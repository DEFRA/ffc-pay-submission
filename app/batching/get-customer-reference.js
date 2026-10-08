const { getSchemeIds } = require('ffc-pay-schemes')

const { ES, FC, IMPS } = getSchemeIds()

const getCustomerReference = (paymentRequest) => {
  if (paymentRequest.schemeId === ES) {
    return paymentRequest.vendor
  }
  if (paymentRequest.schemeId === FC) {
    return paymentRequest.sbi
  }
  if (paymentRequest.schemeId === IMPS) {
    return paymentRequest.trader
  }
  return 'legacy'
}

module.exports = {
  getCustomerReference
}
