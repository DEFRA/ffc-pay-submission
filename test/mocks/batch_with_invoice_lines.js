const { AP } = require('../../app/constants/ledgers')
const { SFI } = require('../../app/constants/pillars')
module.exports = {
  sequence: 1,
  ledger: AP,
  scheme: { batchProperties: { source: 'SOURCE' } },
  paymentRequests: [{
    schemeId: SFI,
    frn: 1234567890,
    marketingYear: 2021,
    deliveryBody: 'RP00',
    currency: 'GBP',
    invoiceNumber: 'S0695764S1248977V001',
    agreementNumber: 'SIP000001233488',
    contractNumber: 'S1248977',
    dueDate: '08/11/2021',
    schedule: 'Q4',
    value: 585541,
    originalInvoiceNumber: 'S0695764S1248977V001',
    invoiceCorrectionReference: 'S0000001S1248977V001',
    recoveryDate: '03/02/2022',
    debtType: 'irr',
    invoiceLines: [
      { schemeCode: '80009', accountCode: 'SOS710', fundCode: 'DRD10', agreementNumber: 'SIP000001233488', description: 'G00 - Gross value of claim', value: 500000 },
      { schemeCode: '80005', accountCode: 'SOS710', fundCode: 'DRD10', agreementNumber: 'SIP000001233488', description: 'G00 - Gross value of claim', value: 106700 },
      { schemeCode: '80005', accountCode: 'SOS927', fundCode: 'DRD10', agreementNumber: 'SIP000001233488', description: 'P24 - Over declaration reduction', value: -27159 },
      { schemeCode: '80003', accountCode: 'SOS710', fundCode: 'DRD10', agreementNumber: 'SIP000001233488', description: 'G00 - Gross value of claim', value: 12000 },
      { schemeCode: '80003', accountCode: 'SOS927', fundCode: 'DRD10', agreementNumber: 'SIP000001233488', description: 'P24 - Over declaration reduction', value: -6000 }
    ]
  }]
}
