const moment = require('moment')
const { MANUAL } = require('../constants/schemes')
const { getSource } = require('./vendor-lines/get-source')

const getFileName = (batch, pillar, fesCode) => {
  if (batch.scheme.schemeId === MANUAL && pillar) {
    const source = getSource(batch.scheme.schemeId, batch.scheme.batchProperties.source, pillar)
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
