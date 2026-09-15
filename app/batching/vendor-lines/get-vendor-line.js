const { getJournalSourceFromPillar } = require('ffc-pay-schemes')
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

const AGREEMENT_NUMBER_INDEX = 28
const stringifiedNumbers = new Set(['0', '1'])

const getVendorLineAP = (paymentRequest, batch, highestValueLine, hasDifferentFundCodes) => {
  const schedule = getSchedule(paymentRequest.schedule, paymentRequest.pillar)
  const valueMultiplier = getValueMultiplier(paymentRequest.providesAccountingValues)
  const source = paymentRequest.fesCode ?? batch.scheme.batchProperties.source
  const paymentType = getPaymentType(paymentRequest.schemeId, paymentRequest.paymentType)
  const paymentTypeValue = stringifiedNumbers.has(paymentType) ? Number(paymentType) : paymentType
  const paymentDescription = getPaymentDescription(paymentRequest.schemeId)
  const paymentDescriptionValue = stringifiedNumbers.has(paymentDescription) ? Number(paymentDescription) : paymentDescription

  const line = [
    'Vendor',
    paymentRequest.frn,
    paymentRequest.claimDate ?? '',
    hasDifferentFundCodes ? 'XXXXX' : highestValueLine.fundCode,
    highestValueLine.schemeCode,
    paymentRequest.marketingYear ?? NOT_APPLICABLE,
    paymentRequest.deliveryBody,
    paymentRequest.invoiceNumber,
    convertToPounds((paymentRequest.value * valueMultiplier)),
    paymentRequest.currency,
    getCustomerReference(paymentRequest),
    '',
    getContractNumber(paymentRequest.schemeId, paymentRequest.contractNumber, paymentRequest.invoiceNumber),
    paymentTypeValue,
    '',
    paymentDescriptionValue,
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

const getVendorLineAR = (paymentRequest, batch, lowestValueLine) => {
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
