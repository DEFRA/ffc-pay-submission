const db = require('../database')
const getExistingPaymentRequest = require('./get-existing-payment-request')
const saveInvoiceLines = require('./save-invoice-lines')
const sendDuplicatePaymentEvent = require('../event/send-duplicate-payment-event')

const savePaymentRequest = async (paymentRequest) => {
  const transaction = await db.transaction()
  try {
    const existingPaymentRequest = await getExistingPaymentRequest(paymentRequest.invoiceNumber, paymentRequest.referenceId, transaction)
    if (existingPaymentRequest) {
      console.info(`Duplicate payment request received, skipping ${paymentRequest.invoiceNumber}`)
      await sendDuplicatePaymentEvent(paymentRequest)
    } else {
      delete paymentRequest.paymentRequestId
      const [savedPaymentRequest] = await db.paymentRequest(transaction)
        .insert({
          schemeId: paymentRequest.schemeId,
          batchId: paymentRequest.batchId,
          sourceSystem: paymentRequest.sourceSystem,
          batch: paymentRequest.batch,
          deliveryBody: paymentRequest.deliveryBody,
          invoiceNumber: paymentRequest.invoiceNumber,
          frn: paymentRequest.frn,
          sbi: paymentRequest.sbi,
          vendor: paymentRequest.vendor,
          trader: paymentRequest.trader,
          ledger: paymentRequest.ledger,
          marketingYear: paymentRequest.marketingYear,
          agreementNumber: paymentRequest.agreementNumber,
          contractNumber: paymentRequest.contractNumber,
          currency: paymentRequest.currency,
          schedule: paymentRequest.schedule,
          dueDate: paymentRequest.dueDate,
          debtType: paymentRequest.debtType,
          recoveryDate: paymentRequest.recoveryDate,
          originalSettlementDate: paymentRequest.originalSettlementDate,
          originalInvoiceNumber: paymentRequest.originalInvoiceNumber,
          invoiceCorrectionReference: paymentRequest.invoiceCorrectionReference,
          value: paymentRequest.value,
          received: paymentRequest.received,
          referenceId: paymentRequest.referenceId,
          correlationId: paymentRequest.correlationId,
          paymentRequestNumber: paymentRequest.paymentRequestNumber,
          paymentType: paymentRequest.paymentType,
          pillar: paymentRequest.pillar,
          exchangeRate: paymentRequest.exchangeRate,
          eventDate: paymentRequest.eventDate,
          claimDate: paymentRequest.claimDate,
          fesCode: paymentRequest.fesCode,
          annualValue: paymentRequest.annualValue,
          remittanceDescription: paymentRequest.remittanceDescription,
          providesAccountingValues: paymentRequest.providesAccountingValues
        })
        .returning('paymentRequestId')
      await db.queue(transaction).insert({ paymentRequestId: savedPaymentRequest.paymentRequestId })
      await saveInvoiceLines(paymentRequest.invoiceLines, savedPaymentRequest.paymentRequestId, transaction)
    }
    await transaction.commit()
  } catch (error) {
    await transaction.rollback()
    throw (error)
  }
}

module.exports = savePaymentRequest
