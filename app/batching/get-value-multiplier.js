const getValueMultiplier = (providesAccountingValues) => {
  return providesAccountingValues ? 1 : -1
}

module.exports = {
  getValueMultiplier
}
