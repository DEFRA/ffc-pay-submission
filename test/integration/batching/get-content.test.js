const { AP, AR } = require('../../../app/constants/ledgers')
const { SFI23, SFI } = require('../../../app/constants/pillars')
const { Q1 } = require('../../../app/constants/schedules')

const getContent = require('../../../app/batching/get-content')
const { CS, IMPS, ES, FC } = require('../../../app/constants/schemes')

const AGREEMENT_NUMBER_INDEX = 28
const FUND_CODE_INDEX = 3

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
    'SOURCE',
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
    'SOURCE',
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
    'SOURCE',
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
  beforeEach(() => {
    batch = {
      sequence: 1,
      ledger: AP,
      scheme: {
        batchProperties: {
          source: 'SOURCE'
        }
      },
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
        invoiceLines: [{
          schemeCode: '80009',
          accountCode: 'SOS710',
          fundCode: 'DRD10',
          agreementNumber: 'SIP000001233488',
          description: 'G00 - Gross value of claim',
          value: 500000
        }, {
          schemeCode: '80005',
          accountCode: 'SOS710',
          fundCode: 'DRD10',
          agreementNumber: 'SIP000001233488',
          description: 'G00 - Gross value of claim',
          value: 106700
        }, {
          schemeCode: '80005',
          accountCode: 'SOS927',
          fundCode: 'DRD10',
          agreementNumber: 'SIP000001233488',
          description: 'P24 - Over declaration reduction',
          value: -27159
        }, {
          schemeCode: '80003',
          accountCode: 'SOS710',
          fundCode: 'DRD10',
          agreementNumber: 'SIP000001233488',
          description: 'G00 - Gross value of claim',
          value: 12000
        }, {
          schemeCode: '80003',
          accountCode: 'SOS927',
          fundCode: 'DRD10',
          agreementNumber: 'SIP000001233488',
          description: 'P24 - Over declaration reduction',
          value: -6000
        }]
      }]
    }
  })

  test('should return as array', () => {
    const content = getContent(batch)
    expect(Array.isArray(content)).toBeTruthy()
  })

  test('should include correct content for AP', () => {
    const content = getContent(batch)
    expect(content).toStrictEqual(scheduledAPRequest)
  })

  test('should include correct content for AR', () => {
    batch.ledger = AR
    const content = getContent(batch)
    expect(content).toStrictEqual(arRequest)
  })

  test('should include correct content for AP if schedule undefined', () => {
    batch.paymentRequests[0].schedule = undefined
    const content = getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if schedule null', () => {
    batch.paymentRequests[0].schedule = null
    const content = getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if no schedule', () => {
    delete batch.paymentRequests[0].schedule
    const content = getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if schedule empty string', () => {
    batch.paymentRequests[0].schedule = ''
    const content = getContent(batch)
    expect(content).toStrictEqual(unscheduledAPRequest)
  })

  test('should include correct content for AP if schedule undefined but manual SFI 23 payment', () => {
    batch.paymentRequests[0].schedule = undefined
    batch.paymentRequests[0].pillar = SFI23
    const content = getContent(batch)
    expect(content[0][28]).toContain(Q1)
  })

  test('should include correct content for AP if schedule undefined but manual SFI payment', () => {
    batch.paymentRequests[0].schedule = undefined
    batch.paymentRequests[0].pillar = SFI
    const content = getContent(batch)
    expect(content[0][28]).toContain(Q1)
  })

  test('should include agreement number on every ledger line if source does not begin with Siti', () => {
    batch.scheme.batchProperties.source = 'NOT_SITI'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === scheduledAPRequest[1][AGREEMENT_NUMBER_INDEX])).toBeTruthy()
  })

  test('should include agreement number on every ledger line if source is SitiELM', () => {
    batch.scheme.batchProperties.source = 'SitiELM'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === scheduledAPRequest[1][AGREEMENT_NUMBER_INDEX])).toBeTruthy()
  })

  test('should include agreement number on every ledger line if source is SITICS', () => {
    batch.scheme.batchProperties.source = 'SITICS'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === scheduledAPRequest[1][AGREEMENT_NUMBER_INDEX])).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins with SITI and is not SitiELM or SITICS', () => {
    batch.scheme.batchProperties.source = 'SITI_SOMETHING'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins with Siti and is not SitiELM or SITICS', () => {
    batch.scheme.batchProperties.source = 'Siti_SOMETHING'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins with siti and is not SitiELM or SITICS', () => {
    batch.scheme.batchProperties.source = 'siti_SOMETHING'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins is Siti', () => {
    batch.scheme.batchProperties.source = 'Siti'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins is SITI', () => {
    batch.scheme.batchProperties.source = 'SITI'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test('should not include agreement number on any ledger line if source begins is siti', () => {
    batch.scheme.batchProperties.source = 'siti'
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test.each([
    CS,
    IMPS,
    ES,
    FC
  ])('should have fund code as XXXXX on vendor line if multiple fund codes and scheme is CS, IMPS, ES, FC, and fund codes are different', (schemeId) => {
    batch.paymentRequests[0].schemeId = schemeId
    batch.paymentRequests[0].invoiceLines[0].fundCode = 'EXQ00'
    const content = getContent(batch)
    const vendor = content.find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).toBe('XXXXX')
  })

  test.each([
    CS,
    IMPS,
    ES,
    FC
  ])('should have fund code as not XXXXX on vendor line if multiple fund codes and scheme is CS, IMPS, ES, FC, and fund codes are all the same', (schemeId) => {
    batch.paymentRequests[0].schemeId = schemeId
    const content = getContent(batch)
    const vendor = content.find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
  })

  test('should have fund code as not XXXXX on vendor line if scheme is not CS, IMPS, ES, FC, and fund codes are all the same', () => {
    const content = getContent(batch)
    const vendor = content.find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
  })

  test('should have fund code as not XXXXX on vendor line if scheme is not CS, IMPS, ES, FC, even if fund codes are different', () => {
    batch.paymentRequests[0].invoiceLines[0].fundCode = 'EXQ00'
    const content = getContent(batch)
    const vendor = content.find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
  })
})
