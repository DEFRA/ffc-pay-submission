const { SFI } = require('../../../app/constants/schemes')
const { GBP } = require('../../../app/constants/currency')
const { M12 } = require('../../../app/constants/schedules')
const { AP } = require('../../../app/constants/ledgers')
const { CORRELATION_ID } = require('../values/correlation-id')
const { SOURCE_SYSTEM } = require('../values/source-system')
const { BATCH } = require('../values/batch')
const { DELIVERY_BODY_RPA } = require('../values/delivery-body')
const { SFI_INVOICE_NUMBER } = require('../values/invoice-number')
const { FRN } = require('../values/frn')
const { SBI } = require('../values/sbi')
const { VENDOR } = require('../values/vendor')
const { TRADER } = require('../values/trader')
const { PAYMENT_REQUEST_NUMBER } = require('../values/payment-request-number')
const { AGREEMENT_NUMBER } = require('../values/agreement-number')
const { CONTRACT_NUMBER } = require('../values/contract-number')
const { MARKETING_YEAR } = require('../values/marketing-year')
const { DUE_DATE_DAX } = require('../values/due-date')
const { PENALTY_DESCRIPTION } = require('../values/description')
const invoiceLine = require('./invoice-line')

module.exports = {
  correlationId: CORRELATION_ID,
  schemeId: SFI,
  sourceSystem: SOURCE_SYSTEM,
  batch: BATCH,
  deliveryBody: DELIVERY_BODY_RPA,
  invoiceNumber: SFI_INVOICE_NUMBER,
  frn: FRN,
  sbi: SBI,
  vendor: VENDOR,
  trader: TRADER,
  paymentRequestNumber: PAYMENT_REQUEST_NUMBER,
  agreementNumber: AGREEMENT_NUMBER,
  contractNumber: CONTRACT_NUMBER,
  marketingYear: MARKETING_YEAR,
  currency: GBP,
  schedule: M12,
  dueDate: DUE_DATE_DAX,
  value: 150.00,
  ledger: AP,
  providesAccountingValues: false,
  invoiceLines: [{
    ...invoiceLine,
    value: 250.00
  }, {
    ...invoiceLine,
    description: PENALTY_DESCRIPTION,
    value: -100.00
  }]
}
