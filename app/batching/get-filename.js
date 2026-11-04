const moment = require('moment')
const { getJournalSourceFromPillar, getSchemeIds, isFRPS } = require('ffc-pay-schemes')
const config = require('../config')

const { MANUAL } = getSchemeIds()

const getFileName = (batch, pillar, fesCode) => {
  let leadingCharacters = 'FFC'

  if (batch.scheme.schemeId === MANUAL && pillar) {
    const source = getJournalSourceFromPillar(batch.scheme.schemeId, batch.scheme.batchProperties.source, pillar)
    if (source !== batch.scheme.batchProperties.source) {
      return `${leadingCharacters}${source}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')} (${source}).csv`
    }
  }

  if (config.useV2FRPSJournals && isFRPS(batch.scheme.schemeId)) {
    leadingCharacters += 'FRPS'
  }

  if (fesCode) {
    return `${leadingCharacters}${fesCode}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')} (${fesCode}).csv`
  }

  return `${leadingCharacters}${batch.scheme.batchProperties.prefix}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')}${batch.scheme.batchProperties.suffix}.csv`
}

module.exports = getFileName
