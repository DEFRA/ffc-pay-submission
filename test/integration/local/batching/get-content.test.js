const getContent = require('../../../../app/batching/get-content')
const { AP, AR } = require('../../../../app/ledgers')
const { SFI_PILOT, SFI } = require('../../../../app/schemes')
let batch

const arRequest = [
  [
    'H',
    1234567890,
    '',
    'GBP',
    'No',
    'S0695764S1248977V001',
    'None',
    '',
    'SITISFI',
    '',
    'S0695764S1248977V001',
    'S0695764S1248977V001',
    'No',
    '',
    '',
    '',
    '',
    'DRD10',
    '80009',
    2021,
    'RP00',
    'END'
  ],
  [
    'L',
    'G00 - Gross value of claim',
    'SOS710',
    '-5000.00',
    '',
    '08/11/2021',
    '03/02/2022',
    '',
    1,
    'DRD10',
    '80009',
    2021,
    'RP00',
    'SIP000001233488',
    'END'
  ],
  [
    'L',
    'G00 - Gross value of claim',
    'SOS710',
    '-1067.00',
    '',
    '08/11/2021',
    '03/02/2022',
    '',
    2,
    'DRD10',
    '80005',
    2021,
    'RP00',
    'SIP000001233488',
    'END'
  ],
  [
    'L',
    'P24 - Over declaration reduction',
    'SOS927',
    '271.59',
    '',
    '08/11/2021',
    '03/02/2022',
    '',
    3,
    'DRD10',
    '80005',
    2021,
    'RP00',
    'SIP000001233488',
    'END'
  ],
  [
    'L',
    'G00 - Gross value of claim',
    'SOS710',
    '-120.00',
    '',
    '08/11/2021',
    '03/02/2022',
    '',
    4,
    'DRD10',
    '80003',
    2021,
    'RP00',
    'SIP000001233488',
    'END'
  ],
  [
    'L',
    'P24 - Over declaration reduction',
    'SOS927',
    '60.00',
    '',
    '08/11/2021',
    '03/02/2022',
    '',
    5,
    'DRD10',
    '80003',
    2021,
    'RP00',
    'SIP000001233488',
    'END'
  ]
]

const scheduledAPRequest = [
  [
    'Vendor',
    1234567890,
    '',
    'DRD10',
    '80009',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-5855.41',
    'GBP',
    'legacy',
    '',
    'S1248977',
    0,
    '',
    1,
    '',
    '',
    '',
    'BACS_GBP',
    'SITISFI',
    '',
    '0001',
    '',
    '08/11/2021',
    'GBP',
    '',
    '',
    'Q4',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80009',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '5000.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    1,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    '',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80005',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '1067.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    2,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    '',
    'END'
  ],
  [
    'Ledger',
    'SOS927',
    '',
    'DRD10',
    '80005',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-271.59',
    'GBP',
    'legacy',
    '',
    '',
    '',
    3,
    '',
    '',
    'P24 - Over declaration reduction',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    '',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80003',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '120.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    4,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    '',
    'END'
  ],
  [
    'Ledger',
    'SOS927',
    '',
    'DRD10',
    '80003',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-60.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    5,
    '',
    '',
    'P24 - Over declaration reduction',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    '',
    'END'
  ]
]

const unscheduledAPRequest = [
  [
    'Vendor',
    1234567890,
    '',
    'DRD10',
    '80009',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-5855.41',
    'GBP',
    'legacy',
    '',
    'S1248977',
    0,
    '',
    1,
    '',
    '',
    '',
    'BACS_GBP',
    'SITISFI',
    '',
    '0001',
    '',
    '08/11/2021',
    'GBP',
    '',
    '',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80009',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '5000.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    1,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80005',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '1067.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    2,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    'END'
  ],
  [
    'Ledger',
    'SOS927',
    '',
    'DRD10',
    '80005',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-271.59',
    'GBP',
    'legacy',
    '',
    '',
    '',
    3,
    '',
    '',
    'P24 - Over declaration reduction',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    'END'
  ],
  [
    'Ledger',
    'SOS710',
    '',
    'DRD10',
    '80003',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '120.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    4,
    '',
    '',
    'G00 - Gross value of claim',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    'END'
  ],
  [
    'Ledger',
    'SOS927',
    '',
    'DRD10',
    '80003',
    2021,
    'RP00',
    'S0695764S1248977V001',
    '-60.00',
    'GBP',
    'legacy',
    '',
    '',
    '',
    5,
    '',
    '',
    'P24 - Over declaration reduction',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    'SIP000001233488',
    'END'
  ]
]

describe('get content', () => {
  beforeEach(async () => {
    batch = {
      sequence: 1,
      ledger: AP,
      scheme: {
        batchProperties: {
          source: 'SITISFI'
        }
      },
      paymentRequests: [{
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
        invoiceLines: [{
          fundCode: 'DRD10',
          schemeCode: '80009',
          accountCode: 'SOS710',
          description: 'G00 - Gross value of claim',
          value: 500000
        }, {
          fundCode: 'DRD10',
          schemeCode: '80005',
          accountCode: 'SOS710',
          description: 'G00 - Gross value of claim',
          value: 106700
        }, {
          fundCode: 'DRD10',
          schemeCode: '80005',
          accountCode: 'SOS927',
          description: 'P24 - Over declaration reduction',
          value: -27159
        }, {
          fundCode: 'DRD10',
          schemeCode: '80003',
          accountCode: 'SOS710',
          description: 'G00 - Gross value of claim',
          value: 12000
        }, {
          fundCode: 'DRD10',
          schemeCode: '80003',
          accountCode: 'SOS927',
          description: 'P24 - Over declaration reduction',
          value: -6000
        }]
      }]
    }
  })

  test('should return as array', async () => {
    const content = await getContent(batch)
    expect(Array.isArray(content)).toBeTruthy()
  })

  test('should include correct content for AP', async () => {
    const content = await getContent(batch)
    expect(content).toStrictEqual(scheduledAPRequest)
  })

  test('should include correct content for AR', async () => {
    batch.ledger = AR
    const content = await getContent(batch)
    expect(content).toStrictEqual(arRequest)
  })

  test('should include correct content for AP if schedule undefined', async () => {
    batch.paymentRequests[0].schedule = undefined
    const content = await getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if schedule null', async () => {
    batch.paymentRequests[0].schedule = null
    const content = await getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if no schedule', async () => {
    delete batch.paymentRequests[0].schedule
    const content = await getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if schedule empty string', async () => {
    batch.paymentRequests[0].schedule = ''
    const content = await getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include agreement number on every ledger line if not SFI', async () => {
    batch.paymentRequests[0].schemeId = SFI_PILOT
    const content = await getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[28] === scheduledAPRequest[1][28])).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if SFI', async () => {
    batch.paymentRequests[0].schemeId = SFI
    const content = await getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[28] === '')).toBeTruthy()
  })
})
