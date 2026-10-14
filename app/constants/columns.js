const TABLES = require('./tables')

const PRIMARY_KEYS = {
  [TABLES.batch]: 'batchId',
  [TABLES.invoiceLine]: 'invoiceLineId',
  [TABLES.paymentRequest]: 'paymentRequestId',
  [TABLES.queue]: 'queueId'
}

const COLUMNS = {
  [TABLES.batch]: [
    'batchId',
    'schemeId',
    'ledger',
    'sequence',
    'created',
    'started',
    'published'
  ],
  [TABLES.batchProperties]: [
    'schemeId',
    'prefix',
    'suffix',
    'source'
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
  ],
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
  [TABLES.queue]: [
    'queueId',
    'paymentRequestId',
    'batchId'
  ],
  [TABLES.scheme]: [
    'schemeId',
    'name'
  ],
  [TABLES.sequence]: [
    'schemeId',
    'nextAP',
    'nextAR'
  ]
}

const pickColumns = (record, table) => {
  return Object.fromEntries(
    Object.entries(record)
      .filter(([column]) => COLUMNS[table].includes(column))
      .filter(([column]) => column !== PRIMARY_KEYS[table])
  )
}

module.exports = {
  PRIMARY_KEYS,
  COLUMNS,
  pickColumns
}
