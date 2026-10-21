const { getSchemeIds } = require('ffc-pay-schemes')
const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['paymentRequest'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const { findPaymentRequests } = require('../../../app/retention/find-payment-requests')

const { MANUAL } = getSchemeIds()

describe('findPaymentRequests', () => {
  const agreementNumber = 'AGR123'
  const frn = 456789
  const schemeId = 10

  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves([])
  })

  test('selects payment request ids by agreementNumber when usesContractNumber is false', async () => {
    const mockResult = [
      { paymentRequestId: 201 },
      { paymentRequestId: 202 }
    ]
    mockDb.builder.resolves(mockResult)

    const result = await findPaymentRequests(agreementNumber, frn, schemeId, false, undefined, mockDb.trx)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.select).toHaveBeenCalledWith('paymentRequestId')
    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId })
    expect(result).toBe(mockResult)
  })

  test('selects payment request ids by contractNumber when usesContractNumber is true', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, true, undefined, mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ contractNumber: agreementNumber, frn, schemeId })
  })

  test('runs on the pool if no transaction provided', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, false)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId })
  })

  test('runs on the pool if transaction is null', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, false, undefined, null)

    expect(mockDb.tables.paymentRequest).toHaveBeenCalledWith(undefined)
  })

  test('includes pillar in where when scheme is manual', async () => {
    await findPaymentRequests(agreementNumber, frn, MANUAL, false, 'SFI23', mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId: MANUAL, pillar: 'SFI23' })
  })

  test('omits pillar from where when scheme is manual but no pillar supplied', async () => {
    await findPaymentRequests(agreementNumber, frn, MANUAL, false, undefined, mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId: MANUAL })
  })

  test('ignores pillar when scheme is not manual', async () => {
    await findPaymentRequests(agreementNumber, frn, schemeId, false, 'SFI23', mockDb.trx)

    expect(mockDb.builder.where).toHaveBeenCalledWith({ agreementNumber, frn, schemeId })
  })

  test('propagates errors', async () => {
    mockDb.builder.rejects(new Error('DB failure'))

    await expect(findPaymentRequests(agreementNumber, frn, schemeId, false, undefined, mockDb.trx)).rejects.toThrow('DB failure')
  })
})
