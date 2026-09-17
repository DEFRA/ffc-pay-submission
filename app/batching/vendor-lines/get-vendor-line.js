const { getJournalSourceFromPillar, isFRPS } = require('ffc-pay-schemes')
const config = require('../../config')
const { convertToPounds } = require('../../currency-convert')
const { getContractNumber } = require('./get-contract-number')
const { getCustomerReference } = require('../get-customer-reference')
const { getPaymentType } = require('./get-payment-type')
const { getPaymentDescription } = require('./get-payment-description')
const { getHeaderDescription } = require('./get-header-description')
const { getBatchNumber } = require('./get-batch-number')
const { getDueDate } = require('./get-due-date')
const { getCurrency } = require('./get-currency')
const { getSchedule } = require('./get-schedule')
const { getLegacyIdentifier } = require('./get-legacy-identifier')
const { getValueMultiplier } = require('../get-value-multiplier')
const { NOT_APPLICABLE } = require('../../constants/not-applicable')
const { getVendorLineAPV2, getVendorLineARV2 } = require('./get-vendor-line-v2')

const AGREEMENT_NUMBER_INDEX = 28
const stringifiedNumbers = new Set(['0', '1'])

const getStringifiedNumber = (value) => (
  stringifiedNumbers.has(value) ? Number(value) : value
)

const getVendorFundCode = (hasDifferentFundCodes, highestValueLine) => (
  hasDifferentFundCodes ? 'XXXXX' : highestValueLine.fundCode
)

const getLegacyVendorLineAP = (
  paymentRequest,
  batch,
  highestValueLine,
  hasDifferentFundCodes
) => {
  const schedule = getSchedule(paymentRequest.schedule, paymentRequest.pillar)
  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  const source = paymentRequest.fesCode ?? batch.scheme.batchProperties.source

  const line = [
    'Vendor',
    paymentRequest.frn,
    paymentRequest.claimDate ?? '',
    getVendorFundCode(hasDifferentFundCodes, highestValueLine),
    highestValueLine.schemeCode,
    paymentRequest.marketingYear ?? NOT_APPLICABLE,
    paymentRequest.deliveryBody,
    paymentRequest.invoiceNumber,
    convertToPounds(paymentRequest.value * valueMultiplier),
    paymentRequest.currency,
    getCustomerReference(paymentRequest),
    '',
    getContractNumber(paymentRequest.schemeId, paymentRequest.contractNumber, paymentRequest.invoiceNumber),
    getStringifiedNumber(getPaymentType(paymentRequest.schemeId, paymentRequest.paymentType)),
    '',
    getStringifiedNumber(getPaymentDescription(paymentRequest.schemeId)),
    '',
    getHeaderDescription(paymentRequest),
    '',
    `BACS_${paymentRequest.currency}`,
    getJournalSourceFromPillar(paymentRequest.schemeId, source, paymentRequest.pillar),
    paymentRequest.exchangeRate ?? '',
    getBatchNumber(paymentRequest.schemeId, batch.sequence, paymentRequest.batch),
    paymentRequest.eventDate ?? '',
    getDueDate(paymentRequest.schemeId, paymentRequest.dueDate),
    getCurrency(paymentRequest.schemeId, paymentRequest.currency),
    '',
    '',
    schedule,
    'END'
  ]

  if (!schedule) {
    line.splice(AGREEMENT_NUMBER_INDEX, 1)
  }

  return line
}

const getVendorLineAP = (paymentRequest, batch, highestValueLine, hasDifferentFundCodes) => {
  const isV2Journal = config.useV2FRPSJournals && isFRPS(paymentRequest.schemeId)

  return isV2Journal
    ? getVendorLineAPV2(paymentRequest, batch, highestValueLine)
    : getLegacyVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes)
}

const getVendorLineAR = (paymentRequest, batch, lowestValueLine) => {
  if (config.useV2FRPSJournals && isFRPS(paymentRequest.schemeId)) {
    return getVendorLineARV2(paymentRequest, batch, lowestValueLine)
  }

  const source = paymentRequest.fesCode ?? batch.scheme.batchProperties.source
  return [
    'H',
    paymentRequest.frn,
    '',
    paymentRequest.currency,
    'No',
    paymentRequest.originalInvoiceNumber,
    'None',
    '',
    getJournalSourceFromPillar(paymentRequest.schemeId, source, paymentRequest.pillar),
    '',
    paymentRequest.invoiceNumber,
    paymentRequest.invoiceNumber,
    'No',
    getLegacyIdentifier(paymentRequest.schemeId, paymentRequest.frn),
    '',
    getCurrency(paymentRequest.schemeId, ''),
    '',
    lowestValueLine.fundCode,
    lowestValueLine.schemeCode,
    paymentRequest.marketingYear ?? NOT_APPLICABLE,
    paymentRequest.deliveryBody,
    'END'
  ]
}

module.exports = {
  getVendorLineAP,
  getVendorLineAR
}
