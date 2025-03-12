require('log-timestamp')
require('./insights').setup()

const { initialiseContainers } = require('./storage')
const messaging = require('./messaging')
const batching = require('./batching')

const config = require('./config')

process.on(['SIGTERM', 'SIGINT'], async () => {
  await messaging.stop()
  process.exit(0)
})

const startApp = async () => {
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
