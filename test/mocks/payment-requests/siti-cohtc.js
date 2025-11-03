const { SITICOHTC } = require('../../../app/constants/schemes')
const { SITICOHTC_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

module.exports = {
  ...paymentRequest,
  schemeId: SITICOHTC,
  invoiceNumber: SITICOHTC_INVOICE_NUMBER
}
