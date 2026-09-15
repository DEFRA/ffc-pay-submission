const { convertToPounds } = require('../../currency-convert')
const { getDescription } = require('./get-description')
const { getValueMultiplier } = require('../get-value-multiplier')

const getLedgerLineAPV2 = (invoiceLine, paymentRequest, lineId, source) => {
  return [
    'Ledger',
    lineId,
    invoiceLine.agreementNumber ?? paymentRequest.agreementNumber,
    invoiceLine.accountCode,
    invoiceLine.marketingYear ?? paymentRequest.marketingYear,
    invoiceLine.fundCode,
    invoiceLine.schemeCode,
    invoiceLine.deliveryBody ?? paymentRequest.deliveryBody,
    paymentRequest.invoiceNumber,
    convertToPounds(invoiceLine.value),
    getDescription(paymentRequest.schemeId, invoiceLine.description)
  ]
}

const getLedgerLineARV2 = (invoiceLine, paymentRequest, lineId, source) => {
  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  return [
    'Ledger',
    lineId,
    invoiceLine.agreementNumber ?? paymentRequest.agreementNumber,
    convertToPounds((invoiceLine.value * valueMultiplier)),
    invoiceLine.fundCode,
    invoiceLine.schemeCode,
    invoiceLine.marketingYear ?? paymentRequest.marketingYear,
    invoiceLine.deliveryBody ?? paymentRequest.deliveryBody,
    invoiceLine.accountCode,
    getDescription(paymentRequest.schemeId, invoiceLine.description)
  ]
}

module.exports = {
  getLedgerLineAPV2,
  getLedgerLineARV2
}
