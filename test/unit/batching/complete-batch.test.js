const { createKnexMock, createQueryBuilder } = require('../../helpers/mock-knex')

const mockDb = createKnexMock(['batch'])

jest.mock('../../../app/database', () => ({
  client: mockDb.knex,
  transaction: mockDb.transaction,
  close: mockDb.close,
  ...mockDb.tables
}))

const completeBatch = require('../../../app/batching/complete-batch')

describe('completeBatch', () => {
  let updateBuilder

  beforeEach(() => {
    jest.clearAllMocks()
    updateBuilder = createQueryBuilder().resolves()
    mockDb.tables.batch.mockReset().mockReturnValueOnce(mockDb.builder).mockReturnValueOnce(updateBuilder)
  })

  test('sets published if not already published', async () => {
    mockDb.builder.resolves({ batchId: 1, published: null })

    await completeBatch(1, mockDb.trx)

    expect(mockDb.tables.batch).toHaveBeenNthCalledWith(1, mockDb.trx)
    expect(mockDb.tables.batch).toHaveBeenNthCalledWith(2, mockDb.trx)
    expect(mockDb.builder.where).toHaveBeenCalledWith({ batchId: 1 })
    expect(updateBuilder.where).toHaveBeenCalledWith({ batchId: 1 })
    expect(updateBuilder.update).toHaveBeenCalledWith({ published: expect.any(Date) })
  })

  test('does not update if already published', async () => {
    mockDb.builder.resolves({ batchId: 1, published: new Date() })

    await completeBatch(1, mockDb.trx)

    expect(updateBuilder.update).not.toHaveBeenCalled()
  })

  test('uses the pool if no transaction provided', async () => {
    mockDb.builder.resolves({ batchId: 1, published: null })

    await completeBatch(1)

    expect(mockDb.tables.batch).toHaveBeenNthCalledWith(1, undefined)
    expect(mockDb.tables.batch).toHaveBeenNthCalledWith(2, undefined)
  })

  test('throws if batch does not exist', async () => {
    mockDb.builder.resolves(undefined)

    await expect(completeBatch(1, mockDb.trx)).rejects.toThrow(TypeError)
  })
})
