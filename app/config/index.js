const Joi = require('joi')
const mqConfig = require('./mq-config')
const dbConfig = require('./db-config')
const storageConfig = require('./storage-config')

// Define config schema
const schema = Joi.object({
  env: Joi.string().valid('development', 'test', 'production').default('development'),
  batchGenerationInterval: Joi.number().default(1800000), // 30 minutes
  batchSize: Joi.number().default(2000),
  batchCap: Joi.number().default(1),
  useV2Events: Joi.boolean().default(true),
  useV2ReturnFiles: Joi.boolean().default(true)
})

// Build config
const config = {
  env: process.env.NODE_ENV,
  batchGenerationInterval: process.env.BATCH_INTERVAL,
  batchSize: process.env.BATCH_SIZE,
  batchCap: process.env.BATCH_CAP,
  useV2Events: process.env.USE_V2_EVENTS,
  useV2ReturnFiles: process.env.USE_V2_RETURN_FILES
}

// Validate config
const result = schema.validate(config, {
  abortEarly: false
})

// Throw if config is invalid
if (result.error) {
  throw new Error(`The server config is invalid. ${result.error.message}`)
}

// Use the Joi validated value
const value = result.value

// Add some helper props
value.isDev = value.env === 'development'
value.isTest = value.env === 'test'
value.isProd = value.env === 'production'
value.submitSubscription = mqConfig.submitSubscription
value.sendTopic = mqConfig.sendTopic
value.eventTopic = mqConfig.eventTopic
value.eventsTopic = mqConfig.eventsTopic
value.dbConfig = dbConfig
value.storageConfig = storageConfig

module.exports = value
