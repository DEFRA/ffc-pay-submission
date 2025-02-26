const Joi = require('joi')

const mqSchema = Joi.object({
  messageQueue: {
    host: Joi.string(),
    username: Joi.string(),
    password: Joi.string(),
    useCredentialChain: Joi.bool().default(false),
    type: Joi.string().default('subscription'),
    appInsights: Joi.object(),
    managedIdentityClientId: Joi.string().optional()
  },
  submitSubscription: {
    address: Joi.string(),
    topic: Joi.string(),
    numberOfReceivers: Joi.number().default(1)
  },
  sendTopic: {
    address: Joi.string()
  },
  eventTopic: {
    address: Joi.string()
  },
  eventsTopic: {
    address: Joi.string()
  }
})
const mqConfig = {
  messageQueue: {
    host: process.env.MESSAGE_QUEUE_HOST,
    username: process.env.MESSAGE_QUEUE_USER,
    password: process.env.MESSAGE_QUEUE_PASSWORD,
    useCredentialChain: process.env.NODE_ENV === 'production',
    type: 'subscription',
    appInsights: process.env.NODE_ENV === 'production' ? require('applicationinsights') : undefined,
    managedIdentityClientId: process.env.AZURE_CLIENT_ID
  },
  submitSubscription: {
    address: process.env.PAYMENTSUBMIT_SUBSCRIPTION_ADDRESS,
    topic: process.env.PAYMENTSUBMIT_TOPIC_ADDRESS,
    numberOfReceivers: process.env.PAYMENTSUBMIT_SUBSCRIPTION_RECEIVERS
  },
  sendTopic: {
    address: process.env.FILESEND_TOPIC_ADDRESS
  },
  eventTopic: {
    address: process.env.EVENT_TOPIC_ADDRESS
  },
  eventsTopic: {
    address: process.env.EVENTS_TOPIC_ADDRESS
  }
}

const mqResult = mqSchema.validate(mqConfig, {
  abortEarly: false
})

// Throw if config is invalid
if (mqResult.error) {
  throw new Error(`The message queue config is invalid. ${mqResult.error.message}`)
}

const submitSubscription = { ...mqResult.value.messageQueue, ...mqResult.value.submitSubscription }
const sendTopic = { ...mqResult.value.messageQueue, ...mqResult.value.sendTopic }
const eventTopic = { ...mqResult.value.messageQueue, ...mqResult.value.eventTopic }
const eventsTopic = { ...mqResult.value.messageQueue, ...mqResult.value.eventsTopic }

module.exports = {
  submitSubscription,
  sendTopic,
  eventTopic,
  eventsTopic
}
