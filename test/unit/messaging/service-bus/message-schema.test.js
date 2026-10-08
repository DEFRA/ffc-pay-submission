const messageSchema = require('../../../../app/messaging/service-bus/message-schema')

describe('message schema', () => {
  test('validates message with body, type and source', async () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    await expect(messageSchema.validateAsync(message)).resolves.toEqual(message)
  })

  test('validates message with null body', async () => {
    const message = {
      body: null,
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    await expect(messageSchema.validateAsync(message)).resolves.toEqual(message)
  })

  test('validates message with missing body', async () => {
    const message = {
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    await expect(messageSchema.validateAsync(message)).resolves.toEqual(message)
  })

  test('rejects message without type', async () => {
    const message = {
      body: { filename: 'test.txt' },
      source: 'ffc-pay-submission'
    }

    await expect(messageSchema.validateAsync(message)).rejects.toThrow('"type" is required')
  })

  test('rejects message without source', async () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send'
    }

    await expect(messageSchema.validateAsync(message)).rejects.toThrow('"source" is required')
  })
})
