const { getSchemeIds } = require('ffc-pay-schemes')

const { ES, FC, IMPS } = getSchemeIds()

const getLineId = (schemeId, lineId) => {
  return [ES, FC, IMPS].includes(schemeId) ? '' : lineId
}

module.exports = {
  getLineId
}
