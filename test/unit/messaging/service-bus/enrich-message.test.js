const { enrichMessage } = require('../../../../app/messaging/service-bus/enrich-message')

describe('enrich message', () => {
  test('copies type and source into applicationProperties', () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    const enriched = enrichMessage(message)

    expect(enriched.applicationProperties).toEqual({
      type: message.type,
      source: message.source
    })
  })

  test('spreads metadata into applicationProperties', () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission',
      metadata: {
        scheme: 'SFI',
        batchId: 123
      }
    }

    const enriched = enrichMessage(message)

    expect(enriched.applicationProperties).toEqual({
      type: message.type,
      source: message.source,
      scheme: 'SFI',
      batchId: 123
    })
  })

  test('preserves original message properties', () => {
    const message = {
      body: { filename: 'test.txt' },
      type: 'uk.gov.defra.ffc.pay.file.send',
      source: 'ffc-pay-submission'
    }

    const enriched = enrichMessage(message)

    expect(enriched.body).toEqual(message.body)
    expect(enriched.type).toBe(message.type)
    expect(enriched.source).toBe(message.source)
  })
})
