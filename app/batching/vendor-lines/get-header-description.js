const { getSchemeIds } = require('ffc-pay-schemes')

const { FC } = getSchemeIds()

const getHeaderDescription = (paymentRequest) => {
  if (paymentRequest.schemeId === FC) {
    return paymentRequest.invoiceLines?.[0]?.description || ''
  }
  return ''
}

module.exports = {
  getHeaderDescription
}
