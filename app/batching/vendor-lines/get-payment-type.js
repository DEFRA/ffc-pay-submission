const { BPS, CS, ES, FC, IMPS } = require('../../constants/schemes')

const getPaymentType = (schemeId, paymentType) => {
  switch (true) {
    case (schemeId === CS && paymentType === '1'):
      return 1
    case schemeId === BPS:
    case schemeId === ES:
    case schemeId === FC:
      return ''
    case schemeId === IMPS:
      return 'No'
    default:
      return 0
  }
}

module.exports = {
  getPaymentType
}
