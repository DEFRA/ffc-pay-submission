const { isFRPS } = require('ffc-pay-schemes')
const config = require('../../config')
const { convertToPounds } = require('../../currency-convert')
const { getCustomerReference } = require('../get-customer-reference')
const { getLineId } = require('./get-line-id')
const { getDescription } = require('./get-description')
const { getAgreementReference } = require('./get-agreement-reference')
const { getValueMultiplier } = require('../get-value-multiplier')
const { NOT_APPLICABLE } = require('../../constants/not-applicable')
const { getLedgerLineAPV2, getLedgerLineARV2 } = require('./get-ledger-line-v2')

const AGREEMENT_NUMBER_INDEX = 28

const getLedgerLineAP = (invoiceLine, paymentRequest, lineId) => {
  if (config.useV2FRPSJournals && isFRPS(paymentRequest.schemeId)) {
    return getLedgerLineAPV2(invoiceLine, paymentRequest, lineId)
  }

  const line = [
    'Ledger',
    invoiceLine.accountCode,
    paymentRequest.claimDate ?? '',
    invoiceLine.fundCode,
    invoiceLine.schemeCode,
    invoiceLine.marketingYear ?? paymentRequest.marketingYear ?? NOT_APPLICABLE,
    invoiceLine.deliveryBody ?? paymentRequest.deliveryBody,
    paymentRequest.invoiceNumber,
    convertToPounds(invoiceLine.value),
    paymentRequest.currency,
    getCustomerReference(paymentRequest),
    '',
    '',
    '',
    getLineId(paymentRequest.schemeId, lineId),
    '',
    '',
    getDescription(paymentRequest.schemeId, invoiceLine.description),
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    getAgreementReference(paymentRequest.schemeId, invoiceLine.agreementNumber ?? paymentRequest.agreementNumber),
    '',
    'END'
  ]

  if (!paymentRequest.schedule) {
    line.splice(AGREEMENT_NUMBER_INDEX, 1)
  }

  return line
}

const getLedgerLineAR = (invoiceLine, paymentRequest, lineId) => {
  if (config.useV2FRPSJournals && isFRPS(paymentRequest.schemeId)) {
    return getLedgerLineARV2(invoiceLine, paymentRequest, lineId)
  }

  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  return [
    'L',
    getDescription(paymentRequest.schemeId, invoiceLine.description),
    invoiceLine.accountCode,
    convertToPounds((invoiceLine.value * valueMultiplier)),
    '',
    paymentRequest.originalSettlementDate ?? paymentRequest.dueDate,
    paymentRequest.recoveryDate,
    '',
    getLineId(paymentRequest.schemeId, lineId),
    invoiceLine.fundCode,
    invoiceLine.schemeCode,
    invoiceLine.marketingYear ?? paymentRequest.marketingYear ?? NOT_APPLICABLE,
    invoiceLine.deliveryBody ?? paymentRequest.deliveryBody,
    getAgreementReference(paymentRequest.schemeId, invoiceLine.agreementNumber ?? paymentRequest.agreementNumber),
    'END'
  ]
}

module.exports = {
  getLedgerLineAP,
  getLedgerLineAR
}
