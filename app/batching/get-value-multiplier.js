const getValueMultiplier = (providesAccountingValues) => {
  // Payments marked with the `providesAccountingValues` flag already follow the correct
  // accounting sign convention and should be passed through unchanged.
  // All other values (e.g. AP header lines and AR invoice lines) are inverted
  // before being sent to D365.
  return providesAccountingValues ? 1 : -1
}

module.exports = {
  getValueMultiplier
}
