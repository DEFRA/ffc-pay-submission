const { FC } = require('../../../../app/constants/schemes')
const { getHeaderDescription } = require('../../../../app/batching/vendor-lines/get-header-description')

let paymentRequest

describe('get header description', () => {
  beforeEach(() => {
    paymentRequest = {
      invoiceLines: [{ description: 'Description' }]
    }
  })

  test('returns empty string if scheme is not FC', () => {
    expect(getHeaderDescription(paymentRequest)).toBe('')
  })

  test.each([
    { desc: 'invoiceLines is empty', lines: [] },
    { desc: 'invoiceLines is undefined', lines: undefined },
    { desc: 'invoiceLines is null', lines: null },
    { desc: 'invoiceLines has no description', lines: [{}] }
  ])('returns empty string if $desc and scheme is FC', ({ lines }) => {
    paymentRequest.schemeId = FC
    paymentRequest.invoiceLines = lines
    expect(getHeaderDescription(paymentRequest)).toBe('')
  })

  test('returns description if invoiceLines has description and scheme is FC', () => {
    paymentRequest.schemeId = FC
    expect(getHeaderDescription(paymentRequest)).toBe('Description')
  })
})
