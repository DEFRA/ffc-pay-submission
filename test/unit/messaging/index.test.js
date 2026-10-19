const messaging = require('../../../app/messaging')
const config = require('../../../app/config')
const { createServiceBusClient, createReceiver, subscribeReceiver, closeSenders } = require('../../../app/messaging/service-bus')
const processPaymentMessage = require('../../../app/messaging/process-payment-message')
const { processRetentionMessage } = require('../../../app/messaging/process-retention-message')
const { createDiagnosticsHandler } = require('../../../app/messaging/diagnostics')

jest.mock('../../../app/config', () => ({
  env: 'test',
  submitSubscription: {
    numberOfReceivers: 2
  },
  retentionSubscription: {},
  dbConfig: {
    test: {}
  }
}))
jest.mock('../../../app/messaging/service-bus')
jest.mock('../../../app/messaging/process-payment-message', () => jest.fn())
jest.mock('../../../app/messaging/process-retention-message', () => ({
  processRetentionMessage: jest.fn()
}))
jest.mock('../../../app/messaging/diagnostics', () => ({
  createDiagnosticsHandler: jest.fn(name => jest.fn().mockName(name))
}))

const createMockReceiver = () => ({
  subscribe: jest.fn(),
  close: jest.fn()
})

describe('Messaging module', () => {
  let sbClient

  beforeEach(() => {
    jest.clearAllMocks()

    sbClient = { close: jest.fn() }
    createServiceBusClient.mockReturnValue(sbClient)
    createReceiver.mockImplementation(() => createMockReceiver())
    subscribeReceiver.mockImplementation(() => {})
    closeSenders.mockResolvedValue(undefined)
  })

  afterEach(async () => {
    await messaging.stop()
    jest.resetAllMocks()
  })

  test('start creates service bus client once', async () => {
    await messaging.start()

    expect(createServiceBusClient).toHaveBeenCalledTimes(1)
  })

  test('start creates correct number of payment receivers plus retention receiver', async () => {
    await messaging.start()

    const totalReceivers = config.submitSubscription.numberOfReceivers + 1
    expect(createReceiver).toHaveBeenCalledTimes(totalReceivers)
  })

  test('start creates payment receivers with submit subscription config', async () => {
    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    for (let i = 0; i < totalPaymentReceivers; i++) {
      expect(createReceiver).toHaveBeenNthCalledWith(i + 1, sbClient, config.submitSubscription)
    }
  })

  test('start creates retention receiver with retention subscription config', async () => {
    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    expect(createReceiver).toHaveBeenNthCalledWith(totalPaymentReceivers + 1, sbClient, config.retentionSubscription)
  })

  test('start subscribes each payment receiver with action, diagnostics handler and config', async () => {
    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    for (let i = 0; i < totalPaymentReceivers; i++) {
      const receiver = createReceiver.mock.results[i].value
      expect(subscribeReceiver).toHaveBeenNthCalledWith(
        i + 1,
        receiver,
        expect.any(Function),
        createDiagnosticsHandler(`payment-receiver-${i + 1}`),
        config.submitSubscription
      )
    }
  })

  test('start subscribes retention receiver with action, diagnostics handler and config', async () => {
    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    const receiver = createReceiver.mock.results[totalPaymentReceivers].value
    expect(subscribeReceiver).toHaveBeenNthCalledWith(
      totalPaymentReceivers + 1,
      receiver,
      expect.any(Function),
      createDiagnosticsHandler('retention-receiver'),
      config.retentionSubscription
    )
  })

  test('payment receiver action delegates to processPaymentMessage', async () => {
    await messaging.start()

    const paymentAction = subscribeReceiver.mock.calls[0][1]
    const receiver = createReceiver.mock.results[0].value
    const message = { body: { frn: 1234567890 } }

    await paymentAction(message, receiver)

    expect(processPaymentMessage).toHaveBeenCalledWith(message, receiver)
  })

  test('retention receiver action delegates to processRetentionMessage', async () => {
    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    const retentionAction = subscribeReceiver.mock.calls[totalPaymentReceivers][1]
    const receiver = createReceiver.mock.results[totalPaymentReceivers].value
    const message = { body: { agreementNumber: 'AG123', frn: 456789 } }

    await retentionAction(message, receiver)

    expect(processRetentionMessage).toHaveBeenCalledWith(message, receiver)
  })

  test('start logs correct info messages', async () => {
    const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

    await messaging.start()

    const totalPaymentReceivers = config.submitSubscription.numberOfReceivers
    for (let i = 0; i < totalPaymentReceivers; i++) {
      expect(consoleInfoSpy).toHaveBeenCalledWith(`Payment receiver ${i + 1} ready to receive payment requests`)
    }
    expect(consoleInfoSpy).toHaveBeenCalledWith('Retention receiver ready')

    consoleInfoSpy.mockRestore()
  })

  test('stop closes all receivers and service bus client and senders', async () => {
    await messaging.start()

    const receiverCloseMocks = createReceiver.mock.results.map(result => result.value.close)
    await messaging.stop()

    receiverCloseMocks.forEach(closeMock => {
      expect(closeMock).toHaveBeenCalledTimes(1)
    })
    expect(sbClient.close).toHaveBeenCalledTimes(1)
    expect(closeSenders).toHaveBeenCalledTimes(1)
  })

  test('stop handles receiver close throwing an error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    createReceiver.mockImplementationOnce(() => ({
      subscribe: jest.fn(),
      close: jest.fn().mockImplementation(() => { throw new Error('Close error') })
    }))

    await messaging.start()
    await messaging.stop()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing receiver: Close error')
    consoleErrorSpy.mockRestore()
  })

  test('stop handles service bus client close throwing an error', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    sbClient.close.mockRejectedValue(new Error('Client close error'))

    await messaging.start()
    await messaging.stop()

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error closing service bus client: Client close error')
    consoleErrorSpy.mockRestore()
  })

  test('stop is safe to call when messaging has not started', async () => {
    await expect(messaging.stop()).resolves.toBeUndefined()
  })
})
