const { getSchemeIds } = require('ffc-pay-schemes')
const { EUR } = require('../../constants/currency')

const { BPS, ES, FC, IMPS } = getSchemeIds()

const getCurrency = (schemeId, paymentRequestCurrency) => {
  switch (schemeId) {
    case BPS:
      return EUR
    case ES:
    case FC:
    case IMPS:
      return ''
    default:
      return paymentRequestCurrency
  }
}

module.exports = {
  getCurrency
}
