const serviceBus = require('../../../../app/messaging/service-bus')

describe('service-bus barrel exports', () => {
  test('exports createServiceBusClient', () => {
    expect(serviceBus.createServiceBusClient).toBeInstanceOf(Function)
  })

  test('exports createServiceBusAdministrationClient', () => {
    expect(serviceBus.createServiceBusAdministrationClient).toBeInstanceOf(Function)
  })

  test('exports enrichMessage', () => {
    expect(serviceBus.enrichMessage).toBeInstanceOf(Function)
  })

  test('exports sendMessage', () => {
    expect(serviceBus.sendMessage).toBeInstanceOf(Function)
  })

  test('exports sendBatchMessages', () => {
    expect(serviceBus.sendBatchMessages).toBeInstanceOf(Function)
  })

  test('exports createReceiver', () => {
    expect(serviceBus.createReceiver).toBeInstanceOf(Function)
  })

  test('exports subscribeReceiver', () => {
    expect(serviceBus.subscribeReceiver).toBeInstanceOf(Function)
  })

  test('exports retry', () => {
    expect(serviceBus.retry).toBeInstanceOf(Function)
  })

  test('exports getSender', () => {
    expect(serviceBus.getSender).toBeInstanceOf(Function)
  })

  test('exports closeSenders', () => {
    expect(serviceBus.closeSenders).toBeInstanceOf(Function)
  })

  test('exports clearCache', () => {
    expect(serviceBus.clearCache).toBeInstanceOf(Function)
  })
})
