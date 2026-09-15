const { getSchemeIds } = require('ffc-pay-schemes')

const { ES, FC, IMPS } = getSchemeIds()

const getAgreementReference = (schemeId, agreementNumber) => {
  if (schemeId === ES || schemeId === FC || schemeId === IMPS) {
    return ''
  }
  return agreementNumber
}

module.exports = {
  getAgreementReference
}
