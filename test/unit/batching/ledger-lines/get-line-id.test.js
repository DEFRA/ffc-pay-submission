const { getSchemeIds } = require('ffc-pay-schemes')
const { getLineId } = require('../../../../app/batching/ledger-lines/get-line-id')

const { ES, IMPS, SFI } = getSchemeIds()

const lineId = 1

describe('get line id', () => {
  test.each([
    { scheme: ES, expected: '' },
    { scheme: IMPS, expected: '' },
    { scheme: SFI, expected: 1 }
  ])('returns $expected for $scheme scheme', ({ scheme, expected }) => {
    expect(getLineId(scheme, lineId)).toBe(expected)
  })
})
