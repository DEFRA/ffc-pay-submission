const { createKnexMock } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['batch'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const completeBatch = require('../../../app/batching/complete-batch')

describe('completeBatch', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb.builder.resolves({ batchId: 1, published: null })
  })

  test('sets published against the transaction if not already published', async () => {
    await completeBatch(1, mockDb.trx)

    expect(mockDb.tables.batch).toHaveBeenCalledWith(mockDb.trx)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ batchId: 1 })
    expect(mockDb.builder.update).toHaveBeenCalledWith({ published: expect.any(Date) })
  })

  test('does not update if already published', async () => {
    mockDb.builder.resolves({ batchId: 1, published: new Date() })

    await completeBatch(1, mockDb.trx)

    expect(mockDb.builder.update).not.toHaveBeenCalled()
  })

  test('runs on the pool if no transaction provided', async () => {
    await completeBatch(1)

    expect(mockDb.tables.batch).toHaveBeenCalledWith(undefined)
  })

  test('throws if batch does not exist', async () => {
    mockDb.builder.resolves(undefined)

    await expect(completeBatch(1, mockDb.trx)).rejects.toThrow(TypeError)
    expect(mockDb.builder.update).not.toHaveBeenCalled()
  })
})
