const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { SITICOHTC_INVOICE_NUMBER } = require('../values/invoice-number')

const { COHT_CAPITAL } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: COHT_CAPITAL,
  invoiceNumber: SITICOHTC_INVOICE_NUMBER
}
