const { BPS, FDMR } = require('../../constants/schemes')
const BPS_FDMR_DESCRIPTION_LENGTH_TO_DROP = 6
const MAX_DESCRIPTION_LENGTH = 60

const getDescription = (schemeId, description) => {
  const eurlessDescription = description.replace(/€/g, 'EUR')
  return (schemeId === BPS || schemeId === FDMR) ? eurlessDescription.substring(BPS_FDMR_DESCRIPTION_LENGTH_TO_DROP) : eurlessDescription.substring(0, MAX_DESCRIPTION_LENGTH)
}

module.exports = {
  getDescription
}
