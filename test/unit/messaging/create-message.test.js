const { SOURCE } = require('../../../app/constants/source')
const createMessage = require('../../../app/messaging/create-message')

describe('create message', () => {
  test('creates message with filename and ledger in body', () => {
    const filename = 'test-file.txt'
    const ledger = 'AP'

    const message = createMessage(filename, ledger)

    expect(message.body).toEqual({ filename, ledger })
  })

  test('sets correct type', () => {
    const message = createMessage('test-file.txt', 'AP')

    expect(message.type).toBe('uk.gov.defra.ffc.pay.file.send')
  })

  test('sets source from constants', () => {
    const message = createMessage('test-file.txt', 'AP')

    expect(message.source).toBe(SOURCE)
  })
})
