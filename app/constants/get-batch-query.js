const getBatchQuery = `
    SELECT "batchId"
    FROM (
      SELECT batches."batchId",
             ROW_NUMBER() OVER (
               PARTITION BY batches."schemeId"
               ORDER BY batches.sequence
             ) AS rn
      FROM batches
      INNER JOIN "paymentRequests"
        ON "paymentRequests"."batchId" = batches."batchId"
      INNER JOIN "invoiceLines"
        ON "invoiceLines"."paymentRequestId" = "paymentRequests"."paymentRequestId"
      WHERE batches.published IS NULL
        AND ("batches"."started" IS NULL OR "batches"."started" <= :delay)
    ) t
    WHERE rn = 1
    LIMIT :batchCap
  `
module.exports = getBatchQuery
