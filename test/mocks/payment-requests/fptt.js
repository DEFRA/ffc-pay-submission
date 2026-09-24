const { getSchemeIds } = require('ffc-pay-schemes')
const paymentRequest = require('./payment-request')
const { FPTT_INVOICE_NUMBER } = require('../values/invoice-number')

const { FPTT } = getSchemeIds()

module.exports = {
  ...paymentRequest,
  schemeId: FPTT,
  invoiceNumber: FPTT_INVOICE_NUMBER,
  fesCode: 'FALS_FPTT',
  providesAccountingValues: true
}
