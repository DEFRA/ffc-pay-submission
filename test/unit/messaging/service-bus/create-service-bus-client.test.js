const { ServiceBusClient } = require('@azure/service-bus')
const { DefaultAzureCredential } = require('@azure/identity')
const { createServiceBusClient } = require('../../../../app/messaging/service-bus/create-service-bus-client')

jest.mock('@azure/service-bus')
jest.mock('@azure/identity')

describe('create service bus client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates client with connection string when provided', () => {
    const config = {
      connectionString: 'test-connection-string'
    }

    createServiceBusClient(config)

    expect(ServiceBusClient).toHaveBeenCalledWith(config.connectionString, undefined)
  })

  test('creates client with default azure credential when useCredentialChain is true', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      useCredentialChain: true
    }
    const credential = { mock: 'credential' }
    DefaultAzureCredential.mockImplementation(() => credential)

    createServiceBusClient(config)

    expect(DefaultAzureCredential).toHaveBeenCalledWith()
    expect(ServiceBusClient).toHaveBeenCalledWith(config.host, credential, undefined)
  })

  test('creates client with managed identity client id when provided', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      useCredentialChain: true,
      managedIdentityClientId: 'managed-id'
    }
    const credential = { mock: 'credential' }
    DefaultAzureCredential.mockImplementation(() => credential)

    createServiceBusClient(config)

    expect(DefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: 'managed-id' })
    expect(ServiceBusClient).toHaveBeenCalledWith(config.host, credential, undefined)
  })

  test('creates client with built connection string by default', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      username: 'user',
      password: 'pass'
    }

    createServiceBusClient(config)

    expect(ServiceBusClient).toHaveBeenCalledWith(
      'Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass',
      undefined
    )
  })

  test('includes UseDevelopmentEmulator when useEmulator is true', () => {
    const config = {
      host: 'localhost',
      username: 'user',
      password: 'pass',
      useEmulator: true
    }

    createServiceBusClient(config)

    expect(ServiceBusClient).toHaveBeenCalledWith(
      'Endpoint=sb://localhost/;SharedAccessKeyName=user;SharedAccessKey=pass;UseDevelopmentEmulator=true',
      undefined
    )
  })

  test('applies retry options when provided', () => {
    const config = {
      connectionString: 'test-connection-string',
      maxRetries: 5,
      retryDelayInMs: 1000,
      maxRetryDelayInMs: 10000,
      retryMode: 'Exponential'
    }

    createServiceBusClient(config)

    expect(ServiceBusClient).toHaveBeenCalledWith(config.connectionString, {
      retryOptions: {
        maxRetries: 5,
        retryDelayInMs: 1000,
        maxRetryDelayInMs: 10000,
        retryMode: 'Exponential'
      }
    })
  })

  test('returns client from ServiceBusClient constructor', () => {
    const client = { mock: 'client' }
    ServiceBusClient.mockImplementation(() => client)

    const result = createServiceBusClient({ connectionString: 'test' })

    expect(result).toBe(client)
  })

  test('handles missing retry options without throwing', () => {
    const client = { mock: 'client' }
    ServiceBusClient.mockImplementation(() => client)

    expect(() => createServiceBusClient({ host: 'test.servicebus.windows.net', username: 'user', password: 'pass' })).not.toThrow()
    expect(ServiceBusClient).toHaveBeenCalledWith(
      'Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass',
      undefined
    )
  })
})
