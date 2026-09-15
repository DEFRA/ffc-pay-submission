const { getSchemeIds } = require('ffc-pay-schemes')

const { ES, FC, IMPS } = getSchemeIds()

const getDueDate = (schemeId, dueDate) => {
  return [ES, FC, IMPS].includes(schemeId) ? '' : dueDate
}

module.exports = {
  getDueDate
}
