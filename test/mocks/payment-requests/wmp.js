const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { WMP_INVOICE_NUMBER } = require('../values/invoice-number')

const { WMP } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: WMP,
  invoiceNumber: WMP_INVOICE_NUMBER,
  fesCode: 'FALS_WMP',
  providesAccountingValues: true
}
