const { getLedgerLineAP, getLedgerLineAR } = require('./get-ledger-line')
const { getVendorLineAP, getVendorLineAR } = require('./get-vendor-line')
const { AP } = require('../ledgers')

const getContent = (batch) => {
  const rows = []
  for (const paymentRequest of batch.paymentRequests) {
    if (batch.ledger === AP) {
      const vendor = getVendorLineAP(paymentRequest, batch)
      rows.push(vendor)
      for (const [lineId, invoiceLine] of paymentRequest.invoiceLines.entries()) {
        const ledger = getLedgerLineAP(invoiceLine, paymentRequest, lineId + 1)
        rows.push(ledger)
      }
    } else {
      const vendorGroups = getVendorGroups(paymentRequest.invoiceLines)
      for (const vendorGroup of vendorGroups) {
        const vendor = getVendorLineAR(paymentRequest, vendorGroup, batch)
        rows.push(vendor)
        for (const [lineId, invoiceLine] of vendorGroup.invoiceLines.entries()) {
          const ledger = getLedgerLineAR(invoiceLine, paymentRequest, lineId + 1)
          rows.push(ledger)
        }
      }
    }
  }

  return rows
}

const getVendorGroups = (invoiceLines) => {
  return [...invoiceLines.reduce((x, y) => {
    // group by scheme and fund, so create key representing the combination
    const key = `${y.schemeCode}-${y.fundCode}`

    // if key doesn't exist then first instance so create new group
    const item = x.get(key) || Object.assign({}, { fundCode: y.fundCode, schemeCode: y.schemeCode, value: 0, invoiceLines: [] })
    item.value += Number(y.value)
    item.invoiceLines.push(y)

    return x.set(key, item)
  }, new Map()).values()]
}

module.exports = getContent
