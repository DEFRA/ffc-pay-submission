const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const getExistingPaymentRequest = require('../../../app/inbound/get-existing-payment-request')

describe('getExistingPaymentRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('looks up by referenceId when provided', async () => {
    await getExistingPaymentRequest('INV1', 'REF1', mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.select).toHaveBeenCalledWith('paymentRequestId')
    expect(mockDb.builder.where).toHaveBeenCalledWith({ referenceId: 'REF1' })
    expect(mockDb.builder.first).toHaveBeenCalledTimes(1)
  })

  test('looks up by invoiceNumber when no referenceId', async () => {
    await getExistingPaymentRequest('INV1', undefined, mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ invoiceNumber: 'INV1' })
  })

  test('returns the matching payment request', async () => {
    mockDb.builder.resolves({ paymentRequestId: 1 })

    const result = await getExistingPaymentRequest('INV1', undefined, mockDb.trx)

    expect(result).toEqual({ paymentRequestId: 1 })
  })

  test('returns null when no match', async () => {
    const result = await getExistingPaymentRequest('INV1', undefined, mockDb.trx)

    expect(result).toBeNull()
  })

  test('runs on the pool if no transaction provided', async () => {
    await getExistingPaymentRequest('INV1')

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('propagates errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(getExistingPaymentRequest('INV1', undefined, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
