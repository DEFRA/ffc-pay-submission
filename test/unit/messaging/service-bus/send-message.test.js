const { sendMessage } = require('../../../../app/messaging/service-bus/send-message')
const { enrichMessage } = require('../../../../app/messaging/service-bus/enrich-message')

jest.mock('../../../../app/messaging/service-bus/enrich-message', () => ({
  enrichMessage: jest.fn(message => ({ ...message, enriched: true }))
}))

describe('send message', () => {
  let sender

  beforeEach(() => {
    jest.clearAllMocks()
    sender = {
      sendMessages: jest.fn().mockResolvedValue()
    }
  })

  test('validates message and sends enriched message', async () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    await sendMessage(sender, message)

    expect(enrichMessage).toHaveBeenCalledWith(message)
    expect(sender.sendMessages).toHaveBeenCalledWith({ ...message, enriched: true }, undefined)
  })

  test('passes options to sender.sendMessages', async () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }
    const options = { transaction: { mock: 'transaction' } }

    await sendMessage(sender, message, options)

    expect(sender.sendMessages).toHaveBeenCalledWith(expect.any(Object), options)
  })

  test('throws validation error when message is invalid', async () => {
    const message = {
      body: { filename: 'test.txt' }
      // missing type and source
    }

    await expect(sendMessage(sender, message)).rejects.toThrow()
    expect(sender.sendMessages).not.toHaveBeenCalled()
  })
})
