const { ES, IMPS, SFI } = require('../../../../app/constants/schemes')
const { getLineId } = require('../../../../app/batching/ledger-lines/get-line-id')

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
