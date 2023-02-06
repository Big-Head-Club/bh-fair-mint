import * as dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { ethers } from 'ethers'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const INPUT_PATH = path.join(__dirname, 'input')

const tokenStartNum = parseInt(process.env.TOKEN_START_NUM)

const INITIAL_ARRAY = Array.from(
  { length: process.env.NUM_TOKENS },
  (_, i) => i + tokenStartNum
)
const BLOCK_HASH = process.env.BLOCK_HASH

/**
 * ============================================================================
 * PROVENANCE HASH
 * ============================================================================
 */

/**
 * Returns a "provenance hash" of the files in a given `directory`. This hash
 * is calculated by first concatenating each file's individual keccak256 hash,
 * then taking the keccak256 hash of the resultant string.
 */
function getProvenanceHash(directory) {
  let concatenatedHashes = new String()
  const files = fs
    .readdirSync(directory)
    .filter((item) => item !== '.gitignore') // Remove '.gitignore' file

  files.forEach((file) => {
    const fileBuffer = fs.readFileSync(path.join(directory, file))
    const fileHash = ethers.utils.keccak256(fileBuffer).substring(2) // Omit '0x' prefix

    concatenatedHashes += fileHash
  })

  const provenanceHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(concatenatedHashes)
  )

  return provenanceHash.substring(2) // Omit '0x' prefix
}

console.log(
  'Provenance hash:',
  getProvenanceHash(path.join(INPUT_PATH, 'metadata-images')),
  '\n'
)

/**
 * ============================================================================
 * RANDOM INDICES FROM BLOCK HASH
 * ============================================================================
 */

console.log('Initial array:', INITIAL_ARRAY, '\n')

/**
 * Returns an array of random indices within the provided `array`, using the
 * supplied `blockHash` to seed the randomization.
 */
function getRandomIndicesFromBlockHash(array, blockHash) {
  let randomIndices = []
  const blockHashBigNumber = ethers.BigNumber.from(blockHash)

  array.forEach((i) => {
    // 1 - Add `array` item `i` to `blockHash`
    const iBigNumber = ethers.BigNumber.from(i)
    const iPlusBlockHashBigNumber = iBigNumber.add(blockHashBigNumber)

    // 2 - Take the keccak256 hash of the above result
    const hash = ethers.utils.keccak256(iPlusBlockHashBigNumber)
    const hashBigNumber = ethers.BigNumber.from(hash)

    // 3 - Return the result modulo the length of the `array`
    randomIndices.push(hashBigNumber.mod(array.length).toNumber())
  })

  return randomIndices
}

const randomIndices = getRandomIndicesFromBlockHash(INITIAL_ARRAY, BLOCK_HASH)
console.log(
  `Random indices derived from block hash ${BLOCK_HASH}:`,
  randomIndices,
  '\n'
)

/**
 * ============================================================================
 * SEEDED FISHER-YATES SHUFFLE
 * ============================================================================
 */

/**
 * Performs a Fisher-Yates shuffle on `array` using the provided `randomIndices`.
 */
function shuffleArray(array, randomIndices) {
  let currentIndex = array.length
  let randomIndex

  // Loop backwards through `array`
  while (currentIndex != 0) {
    currentIndex--
    randomIndex = randomIndices[currentIndex]

    // Swap item at `currentIndex` with item at `randomIndex`
    ;[array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ]
  }

  return array
}

const shuffledArray = shuffleArray(INITIAL_ARRAY, randomIndices)
console.log('Shuffled array:', shuffledArray, '\n')

/**
 * Reverses Fisher-Yates shuffle on `array` using the provided `randomIndices`.
 */
function unshuffleArray(array, randomIndices) {
  for (let i = 0; i < randomIndices.length; i++) {
    ;[array[i], array[randomIndices[i]]] = [array[randomIndices[i]], array[i]]
  }

  return array
}

const unshuffledArray = unshuffleArray(shuffledArray, randomIndices)
console.log('Unshuffled array:', unshuffledArray, '\n')

console.log('Array successfully unshuffled:', unshuffledArray == INITIAL_ARRAY)
