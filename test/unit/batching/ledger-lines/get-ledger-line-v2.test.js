jest.mock('../../../../app/currency-convert', () => ({
  convertToPounds: jest.fn((value) => (value / 100).toFixed(2).toString())
}))

jest.mock('../../../../app/batching/ledger-lines/get-description', () => ({
  getDescription: jest.fn((schemeId, description) => description)
}))

jest.mock('../../../../app/batching/get-value-multiplier', () => ({
  getValueMultiplier: jest.fn((providesAccountingValues) => providesAccountingValues ? -1 : 1)
}))

const { getLedgerLineAPV2, getLedgerLineARV2 } = require('../../../../app/batching/ledger-lines/get-ledger-line-v2')
const { convertToPounds } = require('../../../../app/currency-convert')
const { getDescription } = require('../../../../app/batching/ledger-lines/get-description')
const { getValueMultiplier } = require('../../../../app/batching/get-value-multiplier')

beforeEach(() => {
  jest.clearAllMocks()
})

test('getLedgerLineAPV2 returns the expected AP ledger line', () => {
  const invoiceLine = {
    agreementNumber: 'INV-AGREEMENT',
    accountCode: 'ACCT-1',
    marketingYear: 2024,
    fundCode: 'FUND-1',
    schemeCode: 'SCHEME-1',
    deliveryBody: 'DB-1',
    value: 100,
    description: 'Test description'
  }

  const paymentRequest = {
    agreementNumber: 'PAY-AGREEMENT',
    marketingYear: 2023,
    invoiceNumber: 'INV-123',
    schemeId: 'SCHEME-ABC',
    deliveryBody: 'PAY-DB'
  }

  const result = getLedgerLineAPV2(invoiceLine, paymentRequest, 'LINE-1')

  expect(convertToPounds).toHaveBeenCalledWith(100)
  expect(getDescription).toHaveBeenCalledWith('SCHEME-ABC', 'Test description')

  expect(result).toEqual([
    'Ledger',
    'LINE-1',
    'INV-AGREEMENT',
    'ACCT-1',
    2024,
    'FUND-1',
    'SCHEME-1',
    'DB-1',
    'INV-123',
    '1.00',
    'Test description'
  ])
})

test('getLedgerLineAPV2 uses payment request values when invoice values are missing', () => {
  const invoiceLine = {
    accountCode: 'ACCT-2',
    fundCode: 'FUND-2',
    schemeCode: 'SCHEME-2',
    value: 250,
    description: 'Fallback description'
  }

  const paymentRequest = {
    agreementNumber: 'PAY-AGREEMENT-2',
    marketingYear: 2022,
    invoiceNumber: 'INV-456',
    schemeId: 'SCHEME-XYZ',
    deliveryBody: 'PAY-DB-2'
  }

  const result = getLedgerLineAPV2(invoiceLine, paymentRequest, 'LINE-2')

  expect(result).toEqual([
    'Ledger',
    'LINE-2',
    'PAY-AGREEMENT-2',
    'ACCT-2',
    2022,
    'FUND-2',
    'SCHEME-2',
    'PAY-DB-2',
    'INV-456',
    '2.50',
    'Fallback description'
  ])
})

test('getLedgerLineARV2 returns the expected AR ledger line', () => {
  const invoiceLine = {
    agreementNumber: 'INV-AGREEMENT',
    accountCode: 'ACCT-1',
    marketingYear: 2024,
    fundCode: 'FUND-1',
    schemeCode: 'SCHEME-1',
    deliveryBody: 'DB-1',
    value: 100,
    description: 'Test description'
  }

  const paymentRequest = {
    agreementNumber: 'PAY-AGREEMENT',
    marketingYear: 2023,
    schemeId: 'SCHEME-ABC',
    deliveryBody: 'PAY-DB',
    providesAccountingValues: true
  }

  const result = getLedgerLineARV2(invoiceLine, paymentRequest, 'LINE-3')

  expect(getValueMultiplier).toHaveBeenCalledWith(true)
  expect(convertToPounds).toHaveBeenCalledWith(-100)
  expect(getDescription).toHaveBeenCalledWith('SCHEME-ABC', 'Test description')

  expect(result).toEqual([
    'Ledger',
    'LINE-3',
    'INV-AGREEMENT',
    '-1.00',
    'FUND-1',
    'SCHEME-1',
    2024,
    'DB-1',
    'ACCT-1',
    'Test description'
  ])
})
