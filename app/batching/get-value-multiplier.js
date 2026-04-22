const getValueMultiplier = (providesAccountingValues) => {
  // For accounting purposes, the value of AP header lines and AR invoice lines are usually multiplied by -1 when provided to D365.
  // Schemes listed in the array provide values in the correct accounting way, so should not be amended and instead passed as is.
  return providesAccountingValues ? 1 : -1
}

module.exports = {
  getValueMultiplier
}
