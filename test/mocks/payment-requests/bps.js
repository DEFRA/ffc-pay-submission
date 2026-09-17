const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { BPS_INVOICE_NUMBER } = require('../values/invoice-number')

const { BPS } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: BPS,
  invoiceNumber: BPS_INVOICE_NUMBER
}
