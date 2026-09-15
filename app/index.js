require('log-timestamp')
require('./insights').setup()

const config = require('./config')
const { initialiseContainers } = require('./storage')
const messaging = require('./messaging')
const batching = require('./batching')
const { start: startServer } = require('./server')
const { updateSchemesDatabase } = require('./update-schemes-database')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await messaging.stop()
  process.exit(0)
})

const startApp = async () => {
  await startServer()
  await updateSchemesDatabase()
  if (config.processingActive) {
    await initialiseContainers()
    await messaging.start()
    await batching.start()
  } else {
    console.info('Processing capabilities are currently not enabled in this environment')
  }
}

(async () => {
  await startApp()
})()

module.exports = startApp
