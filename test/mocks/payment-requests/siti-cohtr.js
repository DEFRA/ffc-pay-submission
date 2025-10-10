const { SITICOHTR } = require('../../../app/constants/schemes')
const { SITICOHTR_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

module.exports = {
  ...paymentRequest,
  schemeId: SITICOHTR,
  invoiceNumber: SITICOHTR_INVOICE_NUMBER
}
