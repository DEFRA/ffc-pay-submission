const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { CS_INVOICE_NUMBER } = require('../values/invoice-number')

const { CS } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: CS,
  invoiceNumber: CS_INVOICE_NUMBER
}
