const config = require('../../config')
const { ES, FC, IMPS } = require('../../constants/schemes')

const getBatchNumber = (schemeId, sequence, batchName) => {
  if (schemeId === ES) {
    return ''
  }
  
  if ([FC, IMPS].includes(schemeId) && batchName && config.useV2ReturnFiles) {
    let batchNamePattern
    if (schemeId === FC) {
      batchNamePattern = /^FCAP_(\d{4})_\d*\.dat$/
    } else {
      batchNamePattern = /^FIN_IMPS_A[P|R]_(\d*).INT$/
    }

    const match = batchName.match(batchNamePattern)
    if (match?.[1]) {
      return match[1]
    }
  }

  return sequence.toString().padStart(4, '0')
}

module.exports = {
  getBatchNumber
}
