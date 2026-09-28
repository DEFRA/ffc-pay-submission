const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const getExistingPaymentRequest = require('../../../app/inbound/get-existing-payment-request')

const invoiceNumber = 'S00000001SFIP000001V001'
const referenceId = '70cb0f07-e0cf-449c-86e8-0344f2c6cc6c'

describe('getExistingPaymentRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves()
  })

  test('looks up by referenceId when provided', async () => {
    await getExistingPaymentRequest(invoiceNumber, referenceId, mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.select).toHaveBeenCalledWith('paymentRequestId')
    expect(mockDb.builder.where).toHaveBeenCalledWith({ referenceId })
    expect(mockDb.builder.first).toHaveBeenCalledTimes(1)
  })

  test('looks up by invoiceNumber when no referenceId', async () => {
    await getExistingPaymentRequest(invoiceNumber, undefined, mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ invoiceNumber })
  })

  test('uses the pool if no transaction provided', async () => {
    await getExistingPaymentRequest(invoiceNumber, referenceId)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('returns the matching payment request', async () => {
    mockDb.builder.resolves({ paymentRequestId: 1 })

    const result = await getExistingPaymentRequest(invoiceNumber, referenceId, mockDb.trx)

    expect(result).toEqual({ paymentRequestId: 1 })
  })

  test('returns null if no match', async () => {
    const result = await getExistingPaymentRequest(invoiceNumber, referenceId, mockDb.trx)

    expect(result).toBeNull()
  })
})
