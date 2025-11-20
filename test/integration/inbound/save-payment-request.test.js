const { v4: uuidv4 } = require('uuid')
const db = require('../../../app/data')
const savePaymentRequest = require('../../../app/inbound')

let scheme
let paymentRequest

const createPaymentRequestRow = async (where) => {
  const rows = await db.paymentRequest.findAll({ where })
  return rows[0]
}

const createInvoiceLinesRows = async () => {
  return db.invoiceLine.findAll({
    include: [{
      model: db.paymentRequest,
      as: 'paymentRequest',
      required: true
    }]
  })
}

describe('save payment requests', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = { schemeId: 1, name: 'SFI' }
    paymentRequest = {
      sourceSystem: 'SFIP',
      deliveryBody: 'RP00',
      invoiceNumber: 'S00000001SFIP000001V001',
      frn: 1234567890,
      sbi: 123456789,
      paymentRequestNumber: 1,
      agreementNumber: 'SIP00000000000001',
      contractNumber: 'SFIP000001',
      marketingYear: 2022,
      currency: 'GBP',
      schedule: 'M12',
      dueDate: '2021-08-15',
      value: 15000,
      invoiceLines: [
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          agreementNumber: 'SIP00000000000001',
          description: 'G00 - Gross value of claim',
          value: 25000
        },
        {
          schemeCode: '80001',
          accountCode: 'SOS273',
          fundCode: 'DRD10',
          agreementNumber: 'SIP00000000000001',
          description: 'P02 - Over declaration penalty',
          value: -10000
        }
      ]
    }

    await db.scheme.create(scheme)
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should return payment request header data', async () => {
    await savePaymentRequest(paymentRequest)
    const row = await createPaymentRequestRow({ agreementNumber: paymentRequest.agreementNumber })

    expect(row.invoiceNumber).toBe(paymentRequest.invoiceNumber)
    expect(row.contractNumber).toBe(paymentRequest.contractNumber)
    expect(parseInt(row.frn)).toBe(paymentRequest.frn)
    expect(parseInt(row.sbi)).toBe(paymentRequest.sbi)
    expect(row.currency).toBe(paymentRequest.currency)
    expect(row.dueDate).toBe(paymentRequest.dueDate)
    expect(parseFloat(row.value)).toBe(paymentRequest.value)
  })

  test('should return invoice lines data', async () => {
    await savePaymentRequest(paymentRequest)
    const rows = await createInvoiceLinesRows()

    const expectations = [
      { description: 'G00 - Gross value of claim', value: 25000 },
      { description: 'P02 - Over declaration penalty', value: -10000 }
    ]

    rows.forEach((row, index) => {
      expect(row.schemeCode).toBe('80001')
      expect(row.accountCode).toBe('SOS273')
      expect(row.fundCode).toBe('DRD10')
      expect(row.agreementNumber).toBe(paymentRequest.agreementNumber)
      expect(row.description).toBe(expectations[index].description)
      expect(parseFloat(row.value)).toBe(expectations[index].value)
    })
  })

  test('should save referenceId if provided', async () => {
    paymentRequest.referenceId = uuidv4()
    await savePaymentRequest(paymentRequest)
    const rows = await db.paymentRequest.findAll({ where: { referenceId: paymentRequest.referenceId } })
    expect(rows).toHaveLength(1)
  })

  test('should not save referenceId if not provided', async () => {
    await savePaymentRequest(paymentRequest)
    const row = await createPaymentRequestRow({ invoiceNumber: paymentRequest.invoiceNumber })
    expect(row.requestId).toBeUndefined()
  })

  test.each([
    { desc: 'duplicate invoice number', modify: () => {}, expected: 1 },
    { desc: 'second payment request with referenceId', modify: () => { paymentRequest.referenceId = uuidv4() }, expected: 2 }
  ])('should handle $desc correctly', async ({ modify, expected }) => {
    await savePaymentRequest(paymentRequest)
    modify()
    await savePaymentRequest(paymentRequest)

    const rows = await db.paymentRequest.findAll({ where: { invoiceNumber: paymentRequest.invoiceNumber } })
    expect(rows).toHaveLength(expected)
  })

  test.each([
    { desc: 'empty payment request', modify: () => { paymentRequest = {} } },
    { desc: 'missing invoice lines', modify: () => { delete paymentRequest.invoiceLines } }
  ])('should throw error for $desc', async ({ modify }) => {
    modify()
    await expect(savePaymentRequest(paymentRequest)).rejects.toThrow()
  })
})
