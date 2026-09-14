const { createServiceBusClient } = require('../../../../app/messaging/service-bus/create-service-bus-client')
const { getSender, closeSenders, clearCache } = require('../../../../app/messaging/service-bus/sender-cache')

jest.mock('../../../../app/messaging/service-bus/create-service-bus-client')

describe('sender cache', () => {
  let sbClient
  let sender

  beforeEach(() => {
    jest.clearAllMocks()
    clearCache()

    sender = {
      close: jest.fn().mockResolvedValue()
    }
    sbClient = {
      createSender: jest.fn().mockReturnValue(sender),
      close: jest.fn().mockResolvedValue()
    }
    createServiceBusClient.mockReturnValue(sbClient)
  })

  afterEach(() => {
    clearCache()
  })

  test('creates client for host when first sender requested', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      address: 'test-topic',
      username: 'user',
      password: 'pass'
    }

    getSender(config)

    expect(createServiceBusClient).toHaveBeenCalledWith(config)
  })

  test('reuses client for same host', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      address: 'test-topic',
      username: 'user',
      password: 'pass'
    }

    getSender(config)
    getSender({ ...config, address: 'another-topic' })

    expect(createServiceBusClient).toHaveBeenCalledTimes(1)
  })

  test('creates new client for different host', () => {
    const configOne = {
      host: 'one.servicebus.windows.net',
      address: 'topic',
      username: 'user',
      password: 'pass'
    }
    const configTwo = {
      host: 'two.servicebus.windows.net',
      address: 'topic',
      username: 'user',
      password: 'pass'
    }

    getSender(configOne)
    getSender(configTwo)

    expect(createServiceBusClient).toHaveBeenCalledTimes(2)
  })

  test('creates sender for address when first requested', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      address: 'test-topic',
      username: 'user',
      password: 'pass'
    }

    getSender(config)

    expect(sbClient.createSender).toHaveBeenCalledWith('test-topic')
  })

  test('reuses sender for same address', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      address: 'test-topic',
      username: 'user',
      password: 'pass'
    }

    const firstSender = getSender(config)
    const secondSender = getSender(config)

    expect(sbClient.createSender).toHaveBeenCalledTimes(1)
    expect(firstSender).toBe(secondSender)
  })

  test('creates different sender for different address on same host', () => {
    const configOne = {
      host: 'test.servicebus.windows.net',
      address: 'topic-one',
      username: 'user',
      password: 'pass'
    }
    const configTwo = {
      host: 'test.servicebus.windows.net',
      address: 'topic-two',
      username: 'user',
      password: 'pass'
    }

    getSender(configOne)
    getSender(configTwo)

    expect(sbClient.createSender).toHaveBeenCalledTimes(2)
    expect(sbClient.createSender).toHaveBeenNthCalledWith(1, 'topic-one')
    expect(sbClient.createSender).toHaveBeenNthCalledWith(2, 'topic-two')
  })

  test('closeSenders closes all senders then all clients', async () => {
    const senderOne = { close: jest.fn().mockResolvedValue() }
    const senderTwo = { close: jest.fn().mockResolvedValue() }
    const clientOne = { createSender: jest.fn().mockReturnValue(senderOne), close: jest.fn().mockResolvedValue() }
    const clientTwo = { createSender: jest.fn().mockReturnValue(senderTwo), close: jest.fn().mockResolvedValue() }
    createServiceBusClient
      .mockReturnValueOnce(clientOne)
      .mockReturnValueOnce(clientTwo)

    getSender({ host: 'one.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })
    getSender({ host: 'two.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })

    await closeSenders()

    expect(senderOne.close).toHaveBeenCalledTimes(1)
    expect(senderTwo.close).toHaveBeenCalledTimes(1)
    expect(clientOne.close).toHaveBeenCalledTimes(1)
    expect(clientTwo.close).toHaveBeenCalledTimes(1)
  })

  test('closeSenders logs error when sender close fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    sender.close.mockRejectedValue(new Error('Sender close error'))

    getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })
    await closeSenders()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing sender:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  test('closeSenders logs error when client close fails', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    sbClient.close.mockRejectedValue(new Error('Client close error'))

    getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })
    await closeSenders()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing Service Bus client:', expect.any(Error))
    consoleErrorSpy.mockRestore()
  })

  test('closeSenders clears senders and clients after closing', async () => {
    const newSender = { close: jest.fn().mockResolvedValue() }
    sbClient.createSender
      .mockReturnValueOnce(sender)
      .mockReturnValueOnce(newSender)

    getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })

    await closeSenders()
    const returnedSender = getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })

    expect(createServiceBusClient).toHaveBeenCalledTimes(2)
    expect(returnedSender).toBe(newSender)
  })

  test('clearCache removes senders and clients without closing', () => {
    getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })

    clearCache()
    getSender({ host: 'test.servicebus.windows.net', address: 'topic', username: 'user', password: 'pass' })

    expect(createServiceBusClient).toHaveBeenCalledTimes(2)
    expect(sender.close).not.toHaveBeenCalled()
    expect(sbClient.close).not.toHaveBeenCalled()
  })
})
