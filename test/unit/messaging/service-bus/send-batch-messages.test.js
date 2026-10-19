const { sendBatchMessages } = require('../../../../app/messaging/service-bus/send-batch-messages')
const { enrichMessage } = require('../../../../app/messaging/service-bus/enrich-message')

jest.mock('../../../../app/messaging/service-bus/enrich-message', () => ({
  enrichMessage: jest.fn(message => ({ ...message, enriched: true }))
}))

const createMockBatch = (capacity = 1) => {
  const addedMessages = []
  const batch = {
    count: 0,
    tryAddMessage: jest.fn((message) => {
      if (addedMessages.length < capacity) {
        addedMessages.push(message)
        batch.count = addedMessages.length
        return true
      }
      return false
    }),
    getAddedMessages: () => addedMessages
  }
  return batch
}

describe('send batch messages', () => {
  let sender

  beforeEach(() => {
    jest.clearAllMocks()
    sender = {
      createMessageBatch: jest.fn(),
      sendMessages: jest.fn().mockResolvedValue()
    }
  })

  test('creates message batch and sends all messages', async () => {
    const batch = createMockBatch(2)
    sender.createMessageBatch.mockResolvedValue(batch)

    const messages = [
      { body: { id: 1 }, type: 'type', source: 'source' },
      { body: { id: 2 }, type: 'type', source: 'source' }
    ]

    await sendBatchMessages(sender, messages)

    expect(sender.createMessageBatch).toHaveBeenCalledTimes(1)
    expect(sender.sendMessages).toHaveBeenCalledTimes(1)
    expect(sender.sendMessages).toHaveBeenCalledWith(batch, undefined)
    expect(batch.tryAddMessage).toHaveBeenCalledTimes(2)
  })

  test('enriches each message before adding to batch', async () => {
    const batch = createMockBatch(1)
    sender.createMessageBatch.mockResolvedValue(batch)

    const messages = [
      { body: { id: 1 }, type: 'type', source: 'source' }
    ]

    await sendBatchMessages(sender, messages)

    expect(enrichMessage).toHaveBeenCalledWith(messages[0])
    expect(batch.tryAddMessage).toHaveBeenCalledWith({ ...messages[0], enriched: true })
  })

  test('passes options to sender.sendMessages', async () => {
    const batch = createMockBatch(1)
    sender.createMessageBatch.mockResolvedValue(batch)

    const messages = [{ body: { id: 1 }, type: 'type', source: 'source' }]
    const options = { transaction: { mock: 'transaction' } }

    await sendBatchMessages(sender, messages, options)

    expect(sender.sendMessages).toHaveBeenCalledWith(batch, options)
  })

  test('flushes batch when full and creates new batch', async () => {
    const batch = createMockBatch(1)
    const batchTwo = createMockBatch(1)
    sender.createMessageBatch
      .mockResolvedValueOnce(batch)
      .mockResolvedValueOnce(batchTwo)

    const messages = [
      { body: { id: 1 }, type: 'type', source: 'source' },
      { body: { id: 2 }, type: 'type', source: 'source' }
    ]

    await sendBatchMessages(sender, messages)

    expect(sender.sendMessages).toHaveBeenCalledTimes(2)
    expect(sender.sendMessages).toHaveBeenNthCalledWith(1, batch, undefined)
    expect(sender.sendMessages).toHaveBeenNthCalledWith(2, batchTwo, undefined)
  })

  test('throws error when single message does not fit in empty batch', async () => {
    const batch = createMockBatch(0)
    const batchTwo = createMockBatch(0)
    sender.createMessageBatch
      .mockResolvedValueOnce(batch)
      .mockResolvedValueOnce(batchTwo)

    const messages = [{ body: { id: 1 }, type: 'type', source: 'source' }]

    await expect(sendBatchMessages(sender, messages)).rejects.toThrow('Message too big to fit in a batch')
  })

  test('does not send empty batch at end', async () => {
    const batch = createMockBatch(1)
    const batchTwo = createMockBatch(0)
    sender.createMessageBatch
      .mockResolvedValueOnce(batch)
      .mockResolvedValueOnce(batchTwo)

    const messages = [
      { body: { id: 1 }, type: 'type', source: 'source' },
      { body: { id: 2 }, type: 'type', source: 'source' }
    ]

    await expect(sendBatchMessages(sender, messages)).rejects.toThrow('Message too big to fit in a batch')
    expect(sender.sendMessages).toHaveBeenCalledTimes(1)
    expect(sender.sendMessages).toHaveBeenCalledWith(batch, undefined)
    expect(sender.sendMessages).not.toHaveBeenCalledWith(batchTwo, undefined)
  })
})
