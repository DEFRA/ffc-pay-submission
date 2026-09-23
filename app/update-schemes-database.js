const { getSchemes, getSchemeBatchProperties } = require('ffc-pay-schemes')
const db = require('./data')

const updateSchemesDatabase = async () => {
  console.log('Checking for updates to supported schemes')
  const schemes = getSchemes()

  for (const { schemeId, schemeName } of schemes) {
    const existingScheme = await db.scheme.findOne({
      where: { schemeId }
    })

    await db.scheme.upsert({
      schemeId,
      name: schemeName
    })

    const { prefix, suffix, source } = getSchemeBatchProperties(schemeId)
    await db.batchProperties.upsert({
      schemeId,
      prefix,
      suffix,
      source
    })

    const created = !existingScheme
    console.log(`${schemeName} ${created ? 'created' : 'updated'} and batch properties set`)
    if (created) {
      await db.sequence.create({
        schemeId,
        nextAP: 1,
        nextAR: 1
      })
      console.log(`${schemeName} sequences initialised`)
    }
  }
}

module.exports = {
  updateSchemesDatabase
}
