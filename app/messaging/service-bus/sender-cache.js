const { createServiceBusClient } = require('./create-service-bus-client')

const clients = new Map()
const senders = new Map()

const getClient = (config) => {
  if (!clients.has(config.host)) {
    clients.set(config.host, createServiceBusClient(config))
  }

  return clients.get(config.host)
}

const getSenderKey = (config) => `${config.host}:${config.address}`

const getSender = (config) => {
  const key = getSenderKey(config)
  if (!senders.has(key)) {
    const sbClient = getClient(config)
    senders.set(key, sbClient.createSender(config.address))
  }

  return senders.get(key)
}

const closeSenders = async () => {
  for (const sender of senders.values()) {
    try {
      await sender.close()
    } catch (err) {
      console.error('Error closing sender:', err)
    }
  }
  senders.clear()

  for (const client of clients.values()) {
    try {
      await client.close()
    } catch (err) {
      console.error('Error closing Service Bus client:', err)
    }
  }
  clients.clear()
}

const clearCache = () => {
  senders.clear()
  clients.clear()
}

module.exports = {
  getSender,
  closeSenders,
  clearCache
}
