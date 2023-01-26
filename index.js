import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { Keccak } from 'sha3'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = path.join(__dirname, 'input')

/**
 * Returns a "provenance hash" of the files in a given `directory`. This hash
 * is calculated by first concatenating each file's individual keccak256 hash,
 * then taking the keccak256 hash of the resultant string.
 */
function getProvenanceHash(directory) {
  let concatenatedHashes = new String()
  const files = fs.readdirSync(directory)

  files.forEach(file => {
    const fileBuffer = fs.readFileSync(path.join(directory, file))
    const fileHash = new Keccak(256).update(fileBuffer).digest('hex')

    concatenatedHashes += fileHash
  })

  const provenanceHash = new Keccak(256)
    .update(concatenatedHashes)
    .digest('hex')

  return provenanceHash
}

console.log('Provenance hash:', getProvenanceHash(INPUT_PATH))
