const { subscribeReceiver } = require('../../../../app/messaging/service-bus/subscribe-receiver')

describe('subscribe receiver', () => {
  let receiver
  let action
  let errorHandler

  beforeEach(() => {
    receiver = {
      subscribe: jest.fn()
    }
    action = jest.fn()
    errorHandler = jest.fn()
  })

  test('subscribes receiver with wrapped action and error handler', () => {
    subscribeReceiver(receiver, action, errorHandler, { autoCompleteMessages: true, maxConcurrentCalls: 5 })

    expect(receiver.subscribe).toHaveBeenCalledWith({
      processMessage: expect.any(Function),
      processError: errorHandler
    }, {
      autoCompleteMessages: true,
      maxConcurrentCalls: 5
    })
  })

  test('defaults autoCompleteMessages to false and maxConcurrentCalls to 1', () => {
    subscribeReceiver(receiver, action, errorHandler)

    expect(receiver.subscribe).toHaveBeenCalledWith({
      processMessage: expect.any(Function),
      processError: errorHandler
    }, {
      autoCompleteMessages: false,
      maxConcurrentCalls: 1
    })
  })

  test('wrapped action invokes action with message and receiver', async () => {
    subscribeReceiver(receiver, action, errorHandler)

    const processMessage = receiver.subscribe.mock.calls[0][0].processMessage
    const message = { body: 'test' }

    await processMessage(message)

    expect(action).toHaveBeenCalledWith(message, receiver)
  })
})
