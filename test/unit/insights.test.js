describe('Application Insights', () => {
  const DEFAULT_ENV = process.env
  let useAzureMonitor
  let appInsights

  beforeEach(() => {
    jest.resetModules()

    jest.mock('@azure/monitor-opentelemetry', () => ({
      useAzureMonitor: jest.fn()
    }))

    useAzureMonitor = require('@azure/monitor-opentelemetry').useAzureMonitor

    process.env = { ...DEFAULT_ENV }
    appInsights = require('../../app/insights')
  })

  afterAll(() => {
    process.env = DEFAULT_ENV
  })

  test('does not setup application insights if no connection string', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = undefined

    appInsights.setup()

    expect(useAzureMonitor).not.toHaveBeenCalled()
  })

  test('does setup application insights if connection string present', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'

    appInsights.setup()

    expect(useAzureMonitor).toHaveBeenCalledTimes(1)
    expect(useAzureMonitor).toHaveBeenCalledWith(
      expect.objectContaining({
        connectionString: 'test-connection-string'
      })
    )
  })

  test('sets cloud role when APPINSIGHTS_CLOUDROLE is present', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'
    process.env.APPINSIGHTS_CLOUDROLE = 'TestRole'

    appInsights.setup()

    expect(useAzureMonitor).toHaveBeenCalledWith(
      expect.objectContaining({
        resource: expect.anything()
      })
    )
  })

  test('trackException does not throw if telemetry not initialized', () => {
    const error = new Error('Test error')

    expect(() => appInsights.trackException(error)).not.toThrow()
  })

  test('trackException works after setup', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'

    appInsights.setup()

    const error = new Error('Test error')

    expect(() => appInsights.trackException(error)).not.toThrow()
  })

  test('trackTrace does not throw if telemetry not initialized', () => {
    const message = 'Test trace'

    expect(() => appInsights.trackTrace(message)).not.toThrow()
  })

  test('trackTrace works after setup', () => {
    process.env.APPINSIGHTS_CONNECTIONSTRING = 'test-connection-string'

    appInsights.setup()

    const message = 'Test trace'

    expect(() => appInsights.trackTrace(message)).not.toThrow()
  })
})
