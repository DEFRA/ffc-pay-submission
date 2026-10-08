const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { VET_VISITS_INVOICE_NUMBER } = require('../values/invoice-number')

const { VET_VISITS } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: VET_VISITS,
  invoiceNumber: VET_VISITS_INVOICE_NUMBER
}
