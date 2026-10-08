const { getSchemeIds } = require('ffc-pay-schemes')
const { CONTRACT_NUMBER } = require('../../../mocks/values/contract-number')
const { ES_INVOICE_NUMBER } = require('../../../mocks/values/invoice-number')

const { ES, SFI } = getSchemeIds()

const { getContractNumber } = require('../../../../app/batching/vendor-lines/get-contract-number')

describe('get contract number', () => {
  test('returns contract number for schemes other than ES', () => {
    expect(getContractNumber(SFI, CONTRACT_NUMBER, ES_INVOICE_NUMBER)).toBe(CONTRACT_NUMBER)
  })

  test('returns invoice number element in brackets for ES', () => {
    expect(getContractNumber(ES, CONTRACT_NUMBER, ES_INVOICE_NUMBER)).toBe('1000001')
  })
})
