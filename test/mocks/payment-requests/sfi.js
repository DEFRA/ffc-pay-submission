const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { SFI_INVOICE_NUMBER } = require('../values/invoice-number')

const { SFI } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: SFI,
  invoiceNumber: SFI_INVOICE_NUMBER
}
