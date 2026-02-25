const { FPTT } = require('../../../app/constants/schemes')
const { FPTT_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

module.exports = {
  ...paymentRequest,
  schemeId: FPTT,
  invoiceNumber: FPTT_INVOICE_NUMBER
}
