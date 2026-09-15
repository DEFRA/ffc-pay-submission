jest.mock('../../../../app/currency-convert', () => ({
  convertToPounds: jest.fn((value) => (value / 100).toFixed(2).toString())
}))

jest.mock('../../../../app/batching/get-value-multiplier', () => ({
  getValueMultiplier: jest.fn((providesAccountingValues) => providesAccountingValues ? -1 : 1)
}))

const { getVendorLineAPV2, getVendorLineARV2 } = require('../../../../app/batching/vendor-lines/get-vendor-line-v2')
const { convertToPounds } = require('../../../../app/currency-convert')
const { getValueMultiplier } = require('../../../../app/batching/get-value-multiplier')

beforeEach(() => {
  jest.clearAllMocks()
})

test('getVendorLineAPV2 returns the expected AP vendor line', () => {
  const paymentRequest = {
    frn: 'FRN-1',
    sbi: 'SBI-1',
    fesCode: 'FES-1',
    marketingYear: 2024,
    deliveryBody: 'DB-1',
    invoiceNumber: 'INV-123',
    value: 2500,
    annualValue: 3000,
    contractNumber: 'CONTRACT-1',
    currency: 'GBP',
    dueDate: '2025-01-01',
    remittanceDescription: 'Payment for services',
    providesAccountingValues: true
  }

  const batch = {
    scheme: {
      batchProperties: {
        source: 'BATCH-SOURCE'
      }
    },
    sequence: 7
  }

  const highestValueLine = {
    fundCode: 'FUND-1',
    schemeCode: 'SCHEME-1'
  }

  const result = getVendorLineAPV2(paymentRequest, batch, highestValueLine, false)

  expect(getValueMultiplier).toHaveBeenCalledWith(true)
  expect(convertToPounds).toHaveBeenCalledWith(-2500)

  expect(result).toEqual([
    'Header',
    'FRN-1',
    'SBI-1',
    'FES-1',
    2024,
    'FUND-1',
    'SCHEME-1',
    'DB-1',
    'INV-123',
    '-25.00',
    3000,
    'CONTRACT-1',
    'GBP',
    '2025-01-01',
    7,
    'Payment for services'
  ])
})

test('getVendorLineAPV2 falls back to batch source when fesCode is not provided', () => {
  const paymentRequest = {
    frn: 'FRN-2',
    sbi: 'SBI-2',
    marketingYear: 2023,
    deliveryBody: 'DB-2',
    invoiceNumber: 'INV-456',
    value: 1500,
    annualValue: 2000,
    contractNumber: 'CONTRACT-2',
    currency: 'GBP',
    dueDate: '2025-02-02',
    remittanceDescription: 'Another payment',
    providesAccountingValues: false
  }

  const batch = {
    scheme: {
      batchProperties: {
        source: 'FALLBACK-SOURCE'
      }
    },
    sequence: 3
  }

  const highestValueLine = {
    fundCode: 'FUND-2',
    schemeCode: 'SCHEME-2'
  }

  const result = getVendorLineAPV2(paymentRequest, batch, highestValueLine, true)

  expect(getValueMultiplier).toHaveBeenCalledWith(false)
  expect(convertToPounds).toHaveBeenCalledWith(1500)

  expect(result).toEqual([
    'Header',
    'FRN-2',
    'SBI-2',
    'FALLBACK-SOURCE',
    2023,
    'FUND-2',
    'SCHEME-2',
    'DB-2',
    'INV-456',
    '15.00',
    2000,
    'CONTRACT-2',
    'GBP',
    '2025-02-02',
    3,
    'Another payment'
  ])
})

test('getVendorLineARV2 returns the expected AR vendor line', () => {
  const paymentRequest = {
    frn: 'FRN-3',
    fesCode: 'FES-3',
    marketingYear: 2024,
    deliveryBody: 'DB-3',
    sbi: 'SBI-3',
    value: 3200,
    currency: 'GBP',
    originalInvoiceNumber: 'ORIG-INV-1',
    originalSettlementDate: '2024-06-01',
    recoveryDate: '2024-06-10',
    invoiceNumber: 'INV-789',
    debtType: 'DEBT-TYPE-1',
    providesAccountingValues: true
  }

  const batch = {
    scheme: {
      batchProperties: {
        source: 'BATCH-SOURCE-AR'
      }
    }
  }

  const lowestValueLine = {
    fundCode: 'FUND-3',
    schemeCode: 'SCHEME-3'
  }

  const result = getVendorLineARV2(paymentRequest, batch, lowestValueLine)

  expect(getValueMultiplier).toHaveBeenCalledWith(true)
  expect(convertToPounds).toHaveBeenCalledWith(-3200)

  expect(result).toEqual([
    'Header',
    'FRN-3',
    'FES-3',
    '-32.00',
    'FUND-3',
    'SCHEME-3',
    2024,
    'DB-3',
    'SBI-3',
    'GBP',
    'ORIG-INV-1',
    '2024-06-01',
    '2024-06-10',
    'INV-789',
    'DEBT-TYPE-1'
  ])
})
