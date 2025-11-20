const { Q1, Q4 } = require('../../../../app/constants/schedules')
const { SFI, SFI23 } = require('../../../../app/constants/pillars')
const { getSchedule } = require('../../../../app/batching/vendor-lines/get-schedule')

describe('get schedule', () => {
  test('returns provided schedule if present', () => {
    expect(getSchedule(Q4, SFI)).toBe(Q4)
  })

  test.each([
    { schedule: undefined, pillar: SFI, expected: Q1 },
    { schedule: undefined, pillar: SFI23, expected: Q1 },
    { schedule: undefined, pillar: 'OTHER', expected: undefined }
  ])('returns $expected when schedule is $schedule and pillar is $pillar', ({ schedule, pillar, expected }) => {
    expect(getSchedule(schedule, pillar)).toBe(expected)
  })
})
