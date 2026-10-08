const { retry } = require('../../../../app/messaging/service-bus/retry')

describe('retry', () => {
  test('returns result when function succeeds on first attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success')

    const result = await retry(fn)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  test('retries function when it fails', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const result = await retry(fn, 5, 10)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  test('throws error when all retries exhausted', async () => {
    const error = new Error('persistent failure')
    const fn = jest.fn().mockRejectedValue(error)

    await expect(retry(fn, 2, 10)).rejects.toThrow(error)
    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('uses fixed interval by default', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const result = await retry(fn, 5, 10, false)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })

  test('uses exponential backoff when enabled', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('success')

    const result = await retry(fn, 5, 5, true)

    expect(result).toBe('success')
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
