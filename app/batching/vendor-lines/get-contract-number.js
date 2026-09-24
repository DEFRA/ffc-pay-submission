const { getSchemeIds } = require('ffc-pay-schemes')

const { ES } = getSchemeIds()

const getContractNumber = (schemeId, contractNumber, invoiceNumber) => {
  if (schemeId === ES) {
    return invoiceNumber.substring(invoiceNumber.indexOf('(') + 1, invoiceNumber.indexOf(')'))
  }
  return contractNumber
}

module.exports = {
  getContractNumber
}
