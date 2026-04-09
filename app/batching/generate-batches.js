const db = require('../data')
const getBatches = require('./get-batches')
const getFileName = require('./get-filename')
const getContent = require('./get-content')
const publishBatch = require('./publish-batch')
const { sendSubmissionBatchEvent } = require('../event')
const allocateToBatches = require('./allocate-to-batches')
const sendFileTransferMessage = require('../messaging/send-file-transfer-message')
const completeBatch = require('./complete-batch')

const generateBatches = async () => {
  await allocateToBatches()
  const transaction = await db.sequelize.transaction()
  try {
    const batches = await getBatches(transaction)
    for (const batch of batches) {
      const filename = getFileName(batch, batch.paymentRequests[0].pillar, batch.paymentRequests[0].fesCode)
      const content = getContent(batch)
      await publishBatch(filename, content)
      await sendSubmissionBatchEvent(batch, filename)
      await sendFileTransferMessage(filename, batch)
      await completeBatch(batch.batchId, transaction)
    }
    await transaction.commit()
  } catch (err) {
    console.log(err)
    await transaction.rollback()
    throw err
  }
}

module.exports = generateBatches
