import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = path.join(__dirname, 'input')
const OUTPUT_PATH = path.join(__dirname, 'output')

const config = {
  tokenIdsBeginAt: 0,
  blockHash:
    '0x49066e52661c8e9ab437964e1946d76e51eb771f73fddb1d5a046c0c3b4c9e9e',
  provenanceHashToVerify:
    'db7195cb80b883fca18ca05e512ec1752073386d794d994dd4f74c3da13c66b2',
  paths: {
    input: {
      root: INPUT_PATH,
      metadataImages: path.join(INPUT_PATH, 'metadata-images'),
      metadataJson: path.join(INPUT_PATH, 'metadata-json'),
      verifyImages: path.join(INPUT_PATH, 'verify-images'),
    },
    output: {
      root: OUTPUT_PATH,
      metadataImages: path.join(OUTPUT_PATH, 'metadata-images'),
      metadataJson: path.join(OUTPUT_PATH, 'metadata-json'),
      provenanceHash: path.join(OUTPUT_PATH, 'provenance-hash.txt'),
      shuffleLog: path.join(OUTPUT_PATH, 'shuffle-log.json'),
    },
  },
}

export { config }
