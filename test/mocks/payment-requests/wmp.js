const { WMP } = require('../../../app/constants/schemes')
const { WMP_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

module.exports = {
  ...paymentRequest,
  schemeId: WMP,
  invoiceNumber: WMP_INVOICE_NUMBER,
  fesCode: 'FALS_WMP',
  providesAccountingValues: true
}
