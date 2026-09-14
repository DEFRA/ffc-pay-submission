const { ServiceBusAdministrationClient } = require('@azure/service-bus')
const { DefaultAzureCredential } = require('@azure/identity')
const { createServiceBusAdministrationClient } = require('../../../../app/messaging/service-bus/create-service-bus-admin-client')

jest.mock('@azure/service-bus')
jest.mock('@azure/identity')

describe('create service bus administration client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('creates client with connection string when provided', () => {
    const config = {
      connectionString: 'test-connection-string'
    }

    createServiceBusAdministrationClient(config)

    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(config.connectionString)
  })

  test('creates client with default azure credential when useCredentialChain is true', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      useCredentialChain: true
    }
    const credential = { mock: 'credential' }
    DefaultAzureCredential.mockImplementation(() => credential)

    createServiceBusAdministrationClient(config)

    expect(DefaultAzureCredential).toHaveBeenCalledWith()
    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(config.host, credential)
  })

  test('creates client with managed identity client id when provided', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      useCredentialChain: true,
      managedIdentityClientId: 'managed-id'
    }
    const credential = { mock: 'credential' }
    DefaultAzureCredential.mockImplementation(() => credential)

    createServiceBusAdministrationClient(config)

    expect(DefaultAzureCredential).toHaveBeenCalledWith({ managedIdentityClientId: 'managed-id' })
    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(config.host, credential)
  })

  test('creates client with built connection string by default', () => {
    const config = {
      host: 'test.servicebus.windows.net',
      username: 'user',
      password: 'pass'
    }

    createServiceBusAdministrationClient(config)

    expect(ServiceBusAdministrationClient).toHaveBeenCalledWith(
      'Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=user;SharedAccessKey=pass'
    )
  })

  test('returns client from ServiceBusAdministrationClient constructor', () => {
    const client = { mock: 'client' }
    ServiceBusAdministrationClient.mockImplementation(() => client)

    const result = createServiceBusAdministrationClient({ connectionString: 'test' })

    expect(result).toBe(client)
  })
})
