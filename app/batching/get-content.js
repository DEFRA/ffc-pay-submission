const { getSchemeIds } = require('ffc-pay-schemes')
const { getLedgerLineAP, getLedgerLineAR } = require('./ledger-lines/get-ledger-line')
const { getVendorLineAP, getVendorLineAR } = require('./vendor-lines/get-vendor-line')
const { AP } = require('../constants/ledgers')

const { IMPS, FC, ES, CS } = getSchemeIds()

const getContent = (batch) => {
  let rows = []
  for (const paymentRequest of batch.paymentRequests) {
    const content = batch.ledger === AP ? getAPContent(paymentRequest, batch) : getARContent(paymentRequest, batch)
    rows = rows.concat(content)
  }
  return rows
}

const getAPContent = (paymentRequest, batch) => {
  const highestValueLine = getHighestValueLine(paymentRequest.invoiceLines)
  const hasDifferentFundCodes = checkForDifferentFundCodes(paymentRequest.schemeId, paymentRequest.invoiceLines)
  const rows = []
  rows.push(getVendorLineAP(paymentRequest, batch, highestValueLine, hasDifferentFundCodes))
  for (const [lineId, invoiceLine] of paymentRequest.invoiceLines.entries()) {
    rows.push(getLedgerLineAP(invoiceLine, paymentRequest, lineId + 1))
  }
  return rows
}

const getARContent = (paymentRequest, batch) => {
  const valueLine = paymentRequest.value > 0 ? getHighestValueLine(paymentRequest.invoiceLines) : getLowestValueLine(paymentRequest.invoiceLines)
  const rows = []
  rows.push(getVendorLineAR(paymentRequest, batch, valueLine))
  for (const [lineId, invoiceLine] of paymentRequest.invoiceLines.entries()) {
    rows.push(getLedgerLineAR(invoiceLine, paymentRequest, lineId + 1))
  }
  return rows
}

const getHighestValueLine = (invoiceLines) => {
  return invoiceLines.reduce((prev, current) => (prev.value > current.value) ? prev : current)
}

const getLowestValueLine = (invoiceLines) => {
  return invoiceLines.reduce((prev, current) => (prev.value < current.value) ? prev : current)
}

const checkForDifferentFundCodes = (schemeId, invoiceLines) => {
  if (![IMPS, FC, ES, CS].includes(schemeId)) {
    return false
  }
  const firstFundCode = invoiceLines[0].fundCode
  return !invoiceLines.every(line => line.fundCode === firstFundCode)
}

module.exports = getContent
