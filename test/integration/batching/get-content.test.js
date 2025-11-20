const { AP, AR } = require('../../../app/constants/ledgers')
const { SFI23, SFI } = require('../../../app/constants/pillars')
const { Q1 } = require('../../../app/constants/schedules')
const { CS, IMPS, ES, FC } = require('../../../app/constants/schemes')

const getContent = require('../../../app/batching/get-content')

const arRequest = require('../../mocks/payment-requests/ar-request')
const scheduledAPRequest = require('../../mocks/payment-requests/scheduled-ap-request')
const unscheduledAPRequest = require('../../mocks/payment-requests/unscheduled-ap-request')

const AGREEMENT_NUMBER_INDEX = 28
const FUND_CODE_INDEX = 3

let batch

describe('get content', () => {
  beforeEach(() => {
    batch = structuredClone(require('../../mocks/batch_with_invoice_lines'))
  })

  test('should return an array', () => {
    expect(Array.isArray(getContent(batch))).toBeTruthy()
  })

  test.each([
    [AP, scheduledAPRequest],
    [AR, arRequest]
  ])('should include correct content for %s ledger', (ledger, expected) => {
    batch.ledger = ledger
    expect(getContent(batch)).toStrictEqual(expected)
  })

  test.each([undefined, null, '', 'delete'])(
    'should include correct content for AP if schedule is %p',
    (schedule) => {
      if (schedule === 'delete') delete batch.paymentRequests[0].schedule
      else batch.paymentRequests[0].schedule = schedule
      expect(getContent(batch)).toStrictEqual(unscheduledAPRequest)
    }
  )

  test.each([SFI23, SFI])(
    'should include correct content for AP if schedule undefined but manual %s payment',
    (pillar) => {
      batch.paymentRequests[0].schedule = undefined
      batch.paymentRequests[0].pillar = pillar
      expect(getContent(batch)[0][AGREEMENT_NUMBER_INDEX]).toContain(Q1)
    }
  )

  const sourcesWithAgreement = ['NOT_SITI', 'SitiELM', 'SITICS']
  const sourcesWithoutAgreement = ['SITI_SOMETHING', 'Siti_SOMETHING', 'siti_SOMETHING', 'Siti', 'SITI', 'siti']

  test.each(sourcesWithAgreement)('should include agreement number if source is %s', (source) => {
    batch.scheme.batchProperties.source = source
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x =>
      x[AGREEMENT_NUMBER_INDEX] === scheduledAPRequest[1][AGREEMENT_NUMBER_INDEX]
    )).toBeTruthy()
  })

  test.each(sourcesWithoutAgreement)('should not include agreement number if source is %s', (source) => {
    batch.scheme.batchProperties.source = source
    const content = getContent(batch)
    expect(content.filter(x => x[0] === 'Ledger').every(x => x[AGREEMENT_NUMBER_INDEX] === '')).toBeTruthy()
  })

  test.each([CS, IMPS, ES, FC])(
    'should have fund code as XXXXX on vendor line if scheme %s and multiple fund codes are different',
    (schemeId) => {
      batch.paymentRequests[0].schemeId = schemeId
      batch.paymentRequests[0].invoiceLines[0].fundCode = 'EXQ00'
      const vendor = getContent(batch).find(x => x[0] === 'Vendor')
      expect(vendor[FUND_CODE_INDEX]).toBe('XXXXX')
    }
  )

  test.each([CS, IMPS, ES, FC])(
    'should have fund code not XXXXX on vendor line if scheme %s and all fund codes the same',
    (schemeId) => {
      batch.paymentRequests[0].schemeId = schemeId
      const vendor = getContent(batch).find(x => x[0] === 'Vendor')
      expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
    }
  )

  test('should have fund code not XXXXX if scheme not CS, IMPS, ES, FC even if fund codes are same', () => {
    const vendor = getContent(batch).find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
  })

  test('should have fund code not XXXXX if scheme not CS, IMPS, ES, FC even if fund codes differ', () => {
    batch.paymentRequests[0].invoiceLines[0].fundCode = 'EXQ00'
    const vendor = getContent(batch).find(x => x[0] === 'Vendor')
    expect(vendor[FUND_CODE_INDEX]).not.toBe('XXXXX')
  })
})
