const { getSchemeIds } = require('ffc-pay-schemes')
const { SFI26_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

const { SFI26 } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: SFI26,
  invoiceNumber: SFI26_INVOICE_NUMBER
}
