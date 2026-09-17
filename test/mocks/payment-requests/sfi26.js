const { SFI26 } = require('../../../app/constants/schemes')
const { SFI26_INVOICE_NUMBER } = require('../values/invoice-number')
const paymentRequest = require('./payment-request')

module.exports = {
  ...paymentRequest,
  schemeId: SFI26,
  invoiceNumber: SFI26_INVOICE_NUMBER
}
