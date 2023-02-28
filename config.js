import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = path.join(__dirname, 'input')
const OUTPUT_PATH = path.join(__dirname, 'output')

const config = {
  tokenIdsBeginAt: 1,
  blockHash:
    '0xcee4a5932a21bbfc8470e8c8c3ec0e0a7d31d7467addf28ed74d95bbe77d5788',
  provenanceHashToVerify:
    '335eede1a119b7d76e5eba2960f6bdfc119f374269964ce8eaf04ad0257323d5',
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
