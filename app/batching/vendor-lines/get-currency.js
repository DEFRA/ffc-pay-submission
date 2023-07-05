const { BPS, ES, IMPS } = require('../../constants/schemes')
const { EUR } = require('../../constants/currency')

const getCurrency = (schemeId, paymentRequestCurrency) => {
  switch (schemeId) {
    case BPS:
      return EUR
    case ES:
    case IMPS:
      return ''
    default:
      return paymentRequestCurrency
  }
}

module.exports = {
  getCurrency
}
