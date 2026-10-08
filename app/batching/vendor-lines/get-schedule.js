const { getPillars } = require('ffc-pay-schemes')
const { Q1 } = require('../../constants/schedules')

const { SFI, SFI23 } = getPillars()

const getSchedule = (schedule, pillar) => {
  if (schedule) {
    return schedule
  }

  if ([SFI, SFI23].includes(pillar)) {
    return Q1
  }
}

module.exports = {
  getSchedule
}
