import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
import { ethers } from 'ethers'
import { config } from './config.js'

dotenv.config()

/**
 * Returns an ordered array of token id's beginning with either 0 or 1.
 */
function getOrderedTokenIds() {
  const metadataImages = removeDotGitignore(
    fs.readdirSync(config.paths.input.metadataImages)
  )

  return Array.from(
    { length: metadataImages.length },
    (_, i) => i + parseInt(config.tokenIdsBeginAt)
  )
}

/**
 * Returns the block hash being used to seed the shuffle's randomness.
 */
function getBlockHash() {
  return config.blockHash
}

/**
 * Returns the token id at `index` from the ordered array of all token id's.
 * This is necessary because token id's may start at 0 or 1.
 */
function getTokenIdAtIndex(index) {
  return index + parseInt(config.tokenIdsBeginAt)
}

/**
 * Returns the index of a given `tokenId` in an ordered array of all token ids.
 */
function getIndexOfTokenId(tokenId) {
  return tokenId - parseInt(config.tokenIdsBeginAt)
}

/**
 * Removes `.gitignore` from array. Used when reading the contents of e.g. the
 * metadata images directory.
 */
function removeDotGitignore(array) {
  return array.filter((item) => item !== '.gitignore')
}

/**
 * Returns the keccak256 hash of the image with the '0x' prefix omitted.
 */
function getImageHash(imagePath) {
  const fileBuffer = fs.readFileSync(imagePath)

  return ethers.utils.keccak256(fileBuffer).substring(2) // Omit '0x' prefix
}

/**
 * Returns the 'shuffle log', a json file used to log information about the
 * shuffle process.
 *
 * After all scripts have run, the final shuffle log will take the form:
 * { initialTokenId: { imageHash, newTokenId }, ... }
 */
function getShuffleLog() {
  const logPath = config.paths.output.shuffleLog
  if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, JSON.stringify({}))

  return JSON.parse(fs.readFileSync(config.paths.output.shuffleLog))
}

/**
 * Updates the 'shuffle log' json file.
 */
function setShuffleLog(shuffleLog) {
  fs.writeFileSync(config.paths.output.shuffleLog, JSON.stringify(shuffleLog))
}

/**
 * Returns the provenance hash for the metadata images in the input directory and
 * optionally also logs each token's image hash to the output specified in `options`.
 */
function getProvenanceHash(directory) {
  let provenanceHash = ''
  const metadataImages = removeDotGitignore(fs.readdirSync(directory))
  let concatenatedHashes = new String()

  metadataImages.forEach((image, i) => {
    const tokenId = getTokenIdAtIndex(i)
    const imageHash = getImageHash(path.join(directory, image))

    console.log(`${image}: ${imageHash}`)

    concatenatedHashes += imageHash

    // Update shuffle log with this token's id and image hash
    const shuffleLog = getShuffleLog()
    shuffleLog[tokenId] = { imageHash }
    setShuffleLog(shuffleLog)
  })

  console.log(`Record of hashes logged to ${config.paths.output.shuffleLog}.`)

  provenanceHash = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(concatenatedHashes))
    .substring(2) // Omit '0x' prefix

  return provenanceHash
}

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

/**
 * Performs a Fisher-Yates shuffle on `array` using the provided `randomIndices`.
 */
function shuffleArray(array, randomIndices) {
  console.log('randomIndices:', randomIndices)
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

/**
 * Reverses Fisher-Yates shuffle on `array` using the provided `randomIndices`.
 */
function unshuffleArray(array, randomIndices) {
  for (let i = 0; i < randomIndices.length; i++) {
    ;[array[i], array[randomIndices[i]]] = [array[randomIndices[i]], array[i]]
  }

  return array
}

/**
 * Returns an array of shuffled token id's.
 */
function getShuffledTokenIds(orderedTokenIds, blockHash) {
  // Derive array of random indices within `orderedTokenIds` based on `blockHash`
  console.log(
    `Deriving random token id array indices from block hash ${blockHash}...`
  )
  const randomIndices = getRandomIndicesFromBlockHash(
    orderedTokenIds,
    blockHash
  )
  console.log(
    'Random token id array indices derived from block hash:',
    randomIndices
  )

  // Perform a Fisher-Yates shuffle of `orderedTokenIds` using `randomIndices`
  console.log('Shuffling token ids...')
  const shuffledTokenIds = shuffleArray(orderedTokenIds, randomIndices)
  console.log('Shuffled token ids:', shuffledTokenIds)

  return shuffledTokenIds
}

export {
  getTokenIdAtIndex,
  getIndexOfTokenId,
  getShuffleLog,
  setShuffleLog,
  getImageHash,
  removeDotGitignore,
  getProvenanceHash,
  getOrderedTokenIds,
  getBlockHash,
  getRandomIndicesFromBlockHash,
  shuffleArray,
  unshuffleArray,
  getShuffledTokenIds,
}
