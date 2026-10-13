const TABLES = require('./tables')

const PRIMARY_KEYS = {
  [TABLES.paymentRequest]: 'paymentRequestId',
  [TABLES.invoiceLine]: 'invoiceLineId'
}

const COLUMNS = {
  [TABLES.paymentRequest]: [
    'paymentRequestId',
    'schemeId',
    'batchId',
    'sourceSystem',
    'batch',
    'deliveryBody',
    'invoiceNumber',
    'frn',
    'sbi',
    'vendor',
    'trader',
    'ledger',
    'marketingYear',
    'agreementNumber',
    'contractNumber',
    'currency',
    'schedule',
    'dueDate',
    'debtType',
    'recoveryDate',
    'originalSettlementDate',
    'originalInvoiceNumber',
    'invoiceCorrectionReference',
    'value',
    'received',
    'referenceId',
    'correlationId',
    'paymentRequestNumber',
    'paymentType',
    'pillar',
    'exchangeRate',
    'eventDate',
    'claimDate',
    'fesCode',
    'annualValue',
    'remittanceDescription',
    'providesAccountingValues'
  ],
  [TABLES.invoiceLine]: [
    'invoiceLineId',
    'paymentRequestId',
    'schemeCode',
    'accountCode',
    'fundCode',
    'agreementNumber',
    'description',
    'value',
    'convergence',
    'deliveryBody',
    'marketingYear'
  ]
}

const pickColumns = (record, table) => {
  return Object.fromEntries(
    COLUMNS[table]
      .filter(column => column !== PRIMARY_KEYS[table])
      .map(column => [column, record[column]])
  )
}

module.exports = {
  PRIMARY_KEYS,
  COLUMNS,
  pickColumns
}
