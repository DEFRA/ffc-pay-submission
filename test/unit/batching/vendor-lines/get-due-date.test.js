const { DUE_DATE } = require('../../../mocks/values/due-date')
const { ES, IMPS, SFI } = require('../../../../app/constants/schemes')
const { getDueDate } = require('../../../../app/batching/vendor-lines/get-due-date')

describe('get due date', () => {
  test.each([
    { scheme: ES, expected: '' },
    { scheme: IMPS, expected: '' },
    { scheme: SFI, expected: DUE_DATE }
  ])('returns $expected for $scheme scheme', ({ scheme, expected }) => {
    expect(getDueDate(scheme, DUE_DATE)).toBe(expected)
  })
})
