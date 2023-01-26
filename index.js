import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { Keccak } from 'sha3'
import { ethers } from 'ethers'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = path.join(__dirname, 'input')

/**
 *
 * PROVENANCE HASH
 *
 */

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

/**
 *
 * THE SHUFFLE
 *
 */

const initialArray = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const BLOCK_HASH =
  '0x45711a07caee26dbaf62e2b2cc2f7834eedcc19026be6a07dd48c6e36271d2fc'

/**
 * Returns an array of random indices within the provided `array`, using the
 * supplied `blockHash` to seed the randomization.
 */
function getRandomIndicesFromBlockHash(array, blockHash) {
  let randomIndices = []
  const blockHashBigNumber = ethers.BigNumber.from(blockHash)

  array.forEach(i => {
    // 1 - Add `array` item `i` to `blockHash`
    const iBigNumber = ethers.BigNumber.from(i)
    const iPlusBlockHashBigNumber = iBigNumber.add(blockHashBigNumber)

    // 2 - Take the keccak256 hash of the above result
    const hash = new Keccak(256)
      .update(iPlusBlockHashBigNumber._hex.substring(2)) // Omit the '0x' prefix
      .digest('hex')

    const hashBigNumber = ethers.BigNumber.from(`0x${hash}`)

    // 3 - Return the result modulo the length of the `array`
    randomIndices.push(hashBigNumber.mod(array.length).toNumber())
  })

  return randomIndices
}

console.log(getRandomIndicesFromBlockHash(initialArray, BLOCK_HASH))
