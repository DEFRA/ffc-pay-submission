const { NOT_APPLICABLE } = require('../../../../app/constants/not-applicable')
const { getLedgerLineAP, getLedgerLineAR } = require('../../../../app/batching/ledger-lines/get-ledger-line')

let invoiceLine
let lineId
let source

let paymentRequests

const schemesWithSubstring = [
  { key: 'bps', description: 'Gross value of claim' },
  { key: 'fdmr', description: 'Gross value of claim' }
]

const schemesFullDescription = [
  { key: 'sfi', description: 'G00 - Gross value of claim' },
  { key: 'sfiPilot', description: 'G00 - Gross value of claim' },
  { key: 'lumpSums', description: 'G00 - Gross value of claim' },
  { key: 'vetVisits', description: 'G00 - Gross value of claim' },
  { key: 'cs', description: 'G00 - Gross value of claim' },
  { key: 'sfi23', description: 'G00 - Gross value of claim' },
  { key: 'delinked', description: 'G00 - Gross value of claim' },
  { key: 'sfiExpanded', description: 'G00 - Gross value of claim' },
  { key: 'sitiCohtr', description: 'G00 - Gross value of claim' },
  { key: 'sitiCohtc', description: 'G00 - Gross value of claim' }
]

beforeEach(() => {
  invoiceLine = structuredClone(require('../../../mocks/payment-requests/invoice-line'))

  paymentRequests = {
    sfi: structuredClone(require('../../../mocks/payment-requests/sfi')),
    sfiPilot: structuredClone(require('../../../mocks/payment-requests/sfi-pilot')),
    lumpSums: structuredClone(require('../../../mocks/payment-requests/lump-sums')),
    vetVisits: structuredClone(require('../../../mocks/payment-requests/vet-visits')),
    cs: structuredClone(require('../../../mocks/payment-requests/cs')),
    bps: structuredClone(require('../../../mocks/payment-requests/bps')),
    fdmr: structuredClone(require('../../../mocks/payment-requests/fdmr')),
    sfi23: structuredClone(require('../../../mocks/payment-requests/sfi23')),
    delinked: structuredClone(require('../../../mocks/payment-requests/delinked')),
    sfiExpanded: structuredClone(require('../../../mocks/payment-requests/sfi-expanded')),
    sitiCohtc: structuredClone(require('../../../mocks/payment-requests/siti-cohtc')),
    sitiCohtr: structuredClone(require('../../../mocks/payment-requests/siti-cohtr'))
  }

  lineId = ''
  source = ''
})

describe('get ledger line for AP', () => {
  test.each([
    { desc: 'invoiceLine marketingYear exists', removeFrom: null, expected: () => invoiceLine.marketingYear },
    { desc: 'paymentRequest marketingYear fallback', removeFrom: 'invoice', expected: () => paymentRequests.sfi.marketingYear },
    { desc: 'marketingYear not present returns NOT_APPLICABLE', removeFrom: 'both', expected: () => NOT_APPLICABLE }
  ])('should return correct marketing year when $desc', ({ removeFrom, expected }) => {
    if (removeFrom === 'invoice') {
      delete invoiceLine.marketingYear
    } else if (removeFrom === 'both') {
      delete invoiceLine.marketingYear
      delete paymentRequests.sfi.marketingYear
    }
    const result = getLedgerLineAP(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[5]).toBe(expected())
  })

  test.each(schemesWithSubstring)('should return substring of description for %s', ({ key, description }) => {
    const result = getLedgerLineAP(invoiceLine, paymentRequests[key], lineId, source)
    expect(result[17]).toBe(description)
  })

  test.each(schemesFullDescription)('should not return substring of description for %s', ({ key, description }) => {
    const result = getLedgerLineAP(invoiceLine, paymentRequests[key], lineId, source)
    expect(result[17]).toBe(description)
  })

  test.each([
    { key: 'invoiceLine', index: 27 },
    { key: 'paymentRequest', index: 27 }
  ])('should return agreement number from $key when present', ({ key, index }) => {
    if (key === 'paymentRequest') {
      delete invoiceLine.agreementNumber
    }

    const result = getLedgerLineAP(invoiceLine, paymentRequests.cs, lineId, source)
    expect(result[index]).toBe(paymentRequests.cs.agreementNumber)
  })

  test.each([
    { key: 'invoiceLine', index: 13 },
    { key: 'paymentRequest', index: 13 }
  ])('should return agreement number from $key when AR', ({ key, index }) => {
    if (key === 'paymentRequest') {
      delete invoiceLine.agreementNumber
    }

    const result = getLedgerLineAR(invoiceLine, paymentRequests.cs, lineId, source)
    expect(result[index]).toBe(paymentRequests.cs.agreementNumber)
  })
})

describe('get ledger line for AR', () => {
  test('should return marketing year from invoice line when present', () => {
    const result = getLedgerLineAR(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[11]).toBe(invoiceLine.marketingYear)
  })

  test('should return marketing year from payment request when not present on invoice line', () => {
    delete invoiceLine.marketingYear
    const result = getLedgerLineAR(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[11]).toBe(paymentRequests.sfi.marketingYear)
  })

  test('should return not applicable marketing year when marketing year not present on invoice line or payment request', () => {
    delete invoiceLine.marketingYear
    delete paymentRequests.sfi.marketingYear
    const result = getLedgerLineAR(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[11]).toBe(NOT_APPLICABLE)
  })

  test('should return original settlement date when present', () => {
    paymentRequests.sfi.originalSettlementDate = '01/01/2023'
    const result = getLedgerLineAR(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[5]).toBe(paymentRequests.sfi.originalSettlementDate)
  })

  test('should return due date when original settlement date not present', () => {
    delete paymentRequests.sfi.originalSettlementDate
    const result = getLedgerLineAR(invoiceLine, paymentRequests.sfi, lineId, source)
    expect(result[5]).toBe(paymentRequests.sfi.dueDate)
  })
})
