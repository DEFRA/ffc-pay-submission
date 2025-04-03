const { BPS, FDMR } = require('../../constants/schemes')
const MAX_DESCRIPTION_LENGTH = 60

const getDescription = (schemeId, description) => {
  const eurlessDescription = description.replace(/€/g, 'EUR')
  return (schemeId === BPS || schemeId === FDMR) ? eurlessDescription.substring(6) : eurlessDescription.substring(0, MAX_DESCRIPTION_LENGTH)
}

module.exports = {
  getDescription
}
