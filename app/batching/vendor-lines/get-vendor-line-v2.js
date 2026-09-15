const { convertToPounds } = require('../../currency-convert')
const { getValueMultiplier } = require('../get-value-multiplier')

const getVendorLineAPV2 = (paymentRequest, batch, highestValueLine) => {
  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  const source = paymentRequest.fesCode ?? batch.scheme.batchProperties.source
  return [
    'Header',
    paymentRequest.frn,
    paymentRequest.sbi,
    source,
    paymentRequest.marketingYear,
    highestValueLine.fundCode,
    highestValueLine.schemeCode,
    paymentRequest.deliveryBody,
    paymentRequest.invoiceNumber,
    convertToPounds((paymentRequest.value * valueMultiplier)),
    paymentRequest.annualValue,
    paymentRequest.contractNumber,
    paymentRequest.currency,
    paymentRequest.dueDate,
    batch.sequence,
    paymentRequest.remittanceDescription
  ]
}

const getVendorLineARV2 = (paymentRequest, batch, lowestValueLine) => {
  const source = paymentRequest.fesCode ?? batch.scheme.batchProperties.source
  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  return [
    'Header',
    paymentRequest.frn,
    source,
    convertToPounds((paymentRequest.value * valueMultiplier)),
    lowestValueLine.fundCode,
    lowestValueLine.schemeCode,
    paymentRequest.marketingYear,
    paymentRequest.deliveryBody,
    paymentRequest.sbi,
    paymentRequest.currency,
    paymentRequest.originalInvoiceNumber,
    paymentRequest.originalSettlementDate,
    paymentRequest.recoveryDate,
    paymentRequest.invoiceNumber,
    paymentRequest.debtType
  ]
}

module.exports = {
  getVendorLineAPV2,
  getVendorLineARV2
}
