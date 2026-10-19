const { createReceiver } = require('../../../../app/messaging/service-bus/create-receiver')

describe('create receiver', () => {
  let sbClient

  beforeEach(() => {
    sbClient = {
      createReceiver: jest.fn().mockReturnValue({ mock: 'receiver' })
    }
  })

  test('creates subscription receiver when type is subscription', () => {
    const config = {
      type: 'subscription',
      topic: 'test-topic',
      address: 'test-subscription'
    }

    createReceiver(sbClient, config)

    expect(sbClient.createReceiver).toHaveBeenCalledWith('test-topic', 'test-subscription')
  })

  test('creates queue receiver when type is queue', () => {
    const config = {
      type: 'queue',
      address: 'test-queue'
    }

    createReceiver(sbClient, config)

    expect(sbClient.createReceiver).toHaveBeenCalledWith('test-queue')
  })

  test('throws error for unsupported receiver type', () => {
    const config = {
      type: 'unknown',
      address: 'test-address'
    }

    expect(() => createReceiver(sbClient, config)).toThrow('Unsupported receiver type: unknown')
  })

  test('returns receiver from sbClient.createReceiver', () => {
    const receiver = { mock: 'receiver' }
    sbClient.createReceiver.mockReturnValue(receiver)

    const result = createReceiver(sbClient, { type: 'queue', address: 'test-queue' })

    expect(result).toBe(receiver)
  })
})
