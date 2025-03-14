const publishBatch = require('../../../app/batching/publish-batch')
const { BlobServiceClient } = require('@azure/storage-blob')
const config = require('../../../app/config').storageConfig
let blobServiceClient
let container

describe('publish batch', () => {
  beforeAll(async () => {
    blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
    container = blobServiceClient.getContainerClient(config.container)
    await container.deleteIfExists()
  })
  test('should generate batch with correct filename', async () => {
    const filename = 'PFELM0001_AP_20210827134400 (SITI).csv'
    const content = [['Vendor'], ['Ledger']]
    await publishBatch(filename, content)

    const fileList = []
    for await (const item of container.listBlobsFlat({ prefix: config.folder })) {
      fileList.push(item.name)
    }
    expect(fileList.filter(x => x === `${config.folder}/${filename}`).length).toBe(1)
  })

  test('should generate batch with correct content', async () => {
    const filename = 'PFELM0001_AP_20210827134400 (SITI).csv'
    const content = [['Vendor'], ['Ledger']]
    await publishBatch(filename, content)

    const blobClient = container.getBlobClient(`${config.folder}/${filename}`)
    const downloaded = await blobClient.downloadToBuffer()
    const downloadedContent = downloaded.toString()

    expect(downloadedContent).toContain('Vendor')
    expect(downloadedContent).toContain('Ledger')
  })
})
