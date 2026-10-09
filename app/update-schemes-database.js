const { getSchemes, getSchemeBatchProperties } = require('ffc-pay-schemes')
const db = require('./database')

const updateSchemesDatabase = async () => {
  console.log('Checking for updates to supported schemes')
  const schemes = getSchemes()

  for (const { schemeId, schemeName } of schemes) {
    const existingScheme = (await db.scheme()
      .where({ schemeId })
      .first()) ?? null

    await db.scheme()
      .insert({
        schemeId,
        name: schemeName
      })
      .onConflict('schemeId')
      .merge()

    const { prefix, suffix, source } = getSchemeBatchProperties(schemeId)
    await db.batchProperties()
      .insert({
        schemeId,
        prefix,
        suffix,
        source
      })
      .onConflict('schemeId')
      .merge()

    const created = !existingScheme
    console.log(`${schemeName} ${created ? 'created' : 'updated'} and batch properties set`)
    if (created) {
      await db.sequence().insert({
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
