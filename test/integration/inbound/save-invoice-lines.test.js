const { M12 } = require('../../../app/constants/schedules')
const db = require('../../../app/data')
const saveInvoiceLines = require('../../../app/inbound/save-invoice-lines')

let scheme
let paymentRequest
let invoiceLines
let paymentRequestId

describe('save invoice lines', () => {
  beforeEach(async () => {
    await db.sequelize.truncate({ cascade: true })

    scheme = {
      schemeId: 1,
      name: 'SFI',
      active: true
    }

    paymentRequest = {
      paymentRequestId: 1,
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
      schedule: M12,
      dueDate: '2021-08-15',
      value: 15000
    }

    await db.scheme.create(scheme)
    await db.paymentRequest.create(paymentRequest)

    invoiceLines = [
      {
        schemeCode: '80001',
        accountCode: 'SOS710',
        fundCode: 'DRD10',
        agreementNumber: 'SIP00000000000001',
        description: 'G00 - Gross value of claim',
        value: 25000
      },
      {
        schemeCode: '80001',
        accountCode: 'SOS710',
        fundCode: 'DRD10',
        agreementNumber: 'SIP00000000000001',
        description: 'P02 - Over declaration penalty',
        value: -10000
      }
    ]

    paymentRequestId = 1
  })

  afterAll(async () => {
    await db.sequelize.truncate({ cascade: true })
    await db.sequelize.close()
  })

  test('should save invoice line scheme code', async () => {
    await saveInvoiceLines(invoiceLines, paymentRequestId)
    const invoiceLine = await db.invoiceLine.findOne({ where: { schemeCode: '80001' } })
    expect(invoiceLine.schemeCode).toBeDefined()
  })

  test('should save invoice line with payment request Id', async () => {
    await saveInvoiceLines(invoiceLines, paymentRequestId)
    const invoiceLine = await db.invoiceLine.findOne({ where: { schemeCode: '80001' } })
    expect(invoiceLine.paymentRequestId).toBe(paymentRequestId)
  })

  test('should overwrite invoice line paymentRequestId if already present', async () => {
    invoiceLines.forEach(line => (line.paymentRequestId = 2))
    await saveInvoiceLines(invoiceLines, paymentRequestId)
    const invoiceLine = await db.invoiceLine.findOne({ where: { schemeCode: '80001' } })
    expect(invoiceLine.paymentRequestId).toBe(paymentRequestId)
  })

  test('should save invoice line with agreement number if present', async () => {
    await saveInvoiceLines(invoiceLines, paymentRequestId)
    const invoiceLine = await db.invoiceLine.findOne({ where: { schemeCode: '80001' } })
    expect(invoiceLine.agreementNumber).toBe('SIP00000000000001')
  })

  test('should save invoice line without agreement number if not present', async () => {
    invoiceLines.forEach(line => delete line.agreementNumber)
    await saveInvoiceLines(invoiceLines, paymentRequestId)
    const invoiceLine = await db.invoiceLine.findOne({ where: { schemeCode: '80001' } })
    expect(invoiceLine.agreementNumber).toBeNull()
  })
})
