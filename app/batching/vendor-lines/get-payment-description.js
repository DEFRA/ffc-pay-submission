const { getSchemeIds } = require('ffc-pay-schemes')

const { BPS, ES, FC, IMPS } = getSchemeIds()

const getPaymentDescription = (schemeId) => {
  switch (schemeId) {
    case BPS:
    case ES:
    case FC:
      return ''
    case IMPS:
      return 'PAY'
    default:
      return '1'
  }
}

module.exports = {
  getPaymentDescription
}
