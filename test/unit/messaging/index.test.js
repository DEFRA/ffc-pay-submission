jest.mock('ffc-messaging')
jest.mock('../../../app/messaging/diagnostics', () => ({
  createDiagnosticsHandler: jest.fn(name => jest.fn())
}))

const { MessageReceiver } = require('ffc-messaging')
const messaging = require('../../../app/messaging')
const { createDiagnosticsHandler } = require('../../../app/messaging/diagnostics')
const config = require('../../../app/config')

describe('Messaging module (submit)', () => {
  let subscribeMock, closeConnectionMock

  beforeEach(() => {
    subscribeMock = jest.fn()
    closeConnectionMock = jest.fn()

    MessageReceiver.mockImplementation((cfg, action) => ({
      config: cfg,
      action,
      subscribe: subscribeMock,
      closeConnection: closeConnectionMock
    }))

    createDiagnosticsHandler.mockImplementation(name => jest.fn())
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('start creates all payment receivers and subscribes them', async () => {
    await messaging.start()

    const totalReceivers = config.submitSubscription.numberOfReceivers
    expect(MessageReceiver).toHaveBeenCalledTimes(totalReceivers)

    for (let i = 0; i < totalReceivers; i++) {
      expect(createDiagnosticsHandler).toHaveBeenCalledWith(`payment-receiver-${i + 1}`)
      expect(subscribeMock).toHaveBeenCalled()
    }
  })

  test('stop closes all receiver connections', async () => {
    await messaging.start()
    await messaging.stop()

    const totalReceivers = config.submitSubscription.numberOfReceivers
    expect(closeConnectionMock).toHaveBeenCalledTimes(totalReceivers)
  })

  test('receiver actions are set correctly', async () => {
    await messaging.start()

    const firstReceiverCall = MessageReceiver.mock.calls[0]
    expect(firstReceiverCall[0]).toEqual(config.submitSubscription)
    expect(typeof firstReceiverCall[1]).toBe('function')
  })

  test('handles subscribe throwing an error', async () => {
    subscribeMock.mockRejectedValueOnce(new Error('Subscription error'))
    await expect(messaging.start()).rejects.toThrow('Subscription error')
  })

  test('handles closeConnection throwing an error', async () => {
    subscribeMock.mockResolvedValueOnce()
    closeConnectionMock.mockRejectedValueOnce(new Error('Close error'))

    await messaging.start()
    await expect(messaging.stop()).rejects.toThrow('Close error')
  })
})
