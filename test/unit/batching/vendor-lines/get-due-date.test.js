const { getSchemeIds } = require('ffc-pay-schemes')
const { DUE_DATE } = require('../../../mocks/values/due-date')
const { getDueDate } = require('../../../../app/batching/vendor-lines/get-due-date')

const { ES, IMPS, SFI } = getSchemeIds()

describe('get due date', () => {
  test.each([
    { scheme: ES, expected: '' },
    { scheme: IMPS, expected: '' },
    { scheme: SFI, expected: DUE_DATE }
  ])('returns $expected for $scheme scheme', ({ scheme, expected }) => {
    expect(getDueDate(scheme, DUE_DATE)).toBe(expected)
  })
})
