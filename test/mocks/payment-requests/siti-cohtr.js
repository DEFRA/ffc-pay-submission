const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { SITICOHTR_INVOICE_NUMBER } = require('../values/invoice-number')

const { COHT_REVENUE } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: COHT_REVENUE,
  invoiceNumber: SITICOHTR_INVOICE_NUMBER
}
