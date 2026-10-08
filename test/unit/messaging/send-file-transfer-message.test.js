const { getSender, sendMessage } = require('../../../app/messaging/service-bus')
const sendFileTransferMessage = require('../../../app/messaging/send-file-transfer-message')
const createMessage = require('../../../app/messaging/create-message')
const config = require('../../../app/config')
const { sendSubmissionTransferEvent } = require('../../../app/event')

jest.mock('../../../app/messaging/service-bus')
jest.mock('../../../app/messaging/create-message')
jest.mock('../../../app/config', () => ({
  sendTopic: {
    host: 'test.servicebus.windows.net',
    address: 'filesend-topic',
    username: 'user',
    password: 'pass'
  }
}))
jest.mock('../../../app/event', () => ({
  sendSubmissionTransferEvent: jest.fn()
}))

describe('send file transfer message', () => {
  let sender

  beforeEach(() => {
    jest.clearAllMocks()

    sender = {
      sendMessages: jest.fn().mockResolvedValue()
    }
    getSender.mockReturnValue(sender)
    sendMessage.mockResolvedValue(undefined)
    createMessage.mockReturnValue({
      body: { filename: 'test-file.txt', ledger: 'AP' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    })
    sendSubmissionTransferEvent.mockResolvedValue(undefined)
  })

  test('creates message with filename and ledger', async () => {
    const filename = 'test-file.txt'
    const batch = { ledger: 'AP' }

    await sendFileTransferMessage(filename, batch)

    expect(createMessage).toHaveBeenCalledWith(filename, 'AP')
  })

  test('gets sender for send topic', async () => {
    await sendFileTransferMessage('test-file.txt', { ledger: 'AP' })

    expect(getSender).toHaveBeenCalledWith(config.sendTopic)
  })

  test('sends message using sender', async () => {
    const filename = 'test-file.txt'
    const batch = { ledger: 'AP' }
    const message = createMessage(filename, batch.ledger)

    await sendFileTransferMessage(filename, batch)

    expect(sendMessage).toHaveBeenCalledWith(sender, message)
  })

  test('sends submission transfer event', async () => {
    const filename = 'test-file.txt'

    await sendFileTransferMessage(filename, { ledger: 'AP' })

    expect(sendSubmissionTransferEvent).toHaveBeenCalledWith(filename)
  })

  test('rethrows error when sendMessage fails', async () => {
    const error = new Error('send failed')
    sendMessage.mockRejectedValue(error)

    await expect(sendFileTransferMessage('test-file.txt', { ledger: 'AP' })).rejects.toThrow(error)
  })
})
