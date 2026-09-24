const moment = require('moment')
const { getJournalSourceFromPillar, getSchemeIds } = require('ffc-pay-schemes')

const { MANUAL } = getSchemeIds()

const getFileName = (batch, pillar, fesCode) => {
  if (batch.scheme.schemeId === MANUAL && pillar) {
    const source = getJournalSourceFromPillar(batch.scheme.schemeId, batch.scheme.batchProperties.source, pillar)
    if (source !== batch.scheme.batchProperties.source) {
      return `FFC${source}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')} (${source}).csv`
    }
  }
  if (fesCode) {
    return `FFC${fesCode}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')} (${fesCode}).csv`
  }
  return `${batch.scheme.batchProperties.prefix}_${batch.sequence.toString().padStart(4, '0')}_${batch.ledger}_${moment().format('YYYYMMDDHHmmss')}${batch.scheme.batchProperties.suffix}.csv`
}

module.exports = getFileName
