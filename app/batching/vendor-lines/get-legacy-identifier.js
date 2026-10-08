const { getSchemeIds } = require('ffc-pay-schemes')

const { BPS } = getSchemeIds()

const getLegacyIdentifier = (schemeId, FRN) => {
  if (schemeId === BPS) {
    return FRN
  }
  return ''
}

module.exports = {
  getLegacyIdentifier
}
