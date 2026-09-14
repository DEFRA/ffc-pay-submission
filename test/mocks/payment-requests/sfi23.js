const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { SFI23_INVOICE_NUMBER } = require('../values/invoice-number')

const { SFI23 } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: SFI23,
  invoiceNumber: SFI23_INVOICE_NUMBER
}
