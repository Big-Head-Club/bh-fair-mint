import fs from 'fs'
import path from 'path'
import {
  getOrderedTokenIds,
  getBlockHash,
  getShuffleLog,
  getRandomIndicesFromBlockHash,
  shuffleArray,
  getTokenIdAtIndex,
  setShuffleLog,
} from '../index.js'
import { config } from '../config.js'

/**
 * Init - Derives the random indices required by the Fisher-Yates shuffle from
 * the block hash, calculates a shuffled array of token id's, updates the
 * shuffle log with the new token id for each original id, then copies and
 * renames each (shuffled) metadata token image and json to the output directory.
 *
 * @todo - Metadata json files may each need their `image` property updated
 * with the new post-shuffle token id.
 */
;(function init() {
  const blockHash = getBlockHash()
  const orderedTokenIds = getOrderedTokenIds()
  const shuffleLog = getShuffleLog()

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

  // Perform a Fisher-Yates shuffle of a copy of `orderedTokenIds` using `randomIndices`
  console.log('Shuffling token ids...')
  const shuffledTokenIds = shuffleArray([...orderedTokenIds], randomIndices)
  console.log('Shuffled token ids:', shuffledTokenIds)

  // For each shuffled token id, set its `newTokenId` property in shuffle log
  shuffledTokenIds.forEach((shuffledTokenId, i) => {
    const orderedTokenId = getTokenIdAtIndex(i)

    shuffleLog[shuffledTokenId].newTokenId = orderedTokenId

    setShuffleLog(shuffleLog)
  })

  // For each token, output the reordered (renamed) metadata images and json
  orderedTokenIds.forEach((orderedTokenId) => {
    const newTokenId = shuffleLog[orderedTokenId].newTokenId

    // Copy renamed metadata image to the output directory
    fs.copyFile(
      path.join(config.paths.input.metadataImages, `${orderedTokenId}.png`),
      path.join(config.paths.output.metadataImages, `${newTokenId}.png`),
      (err) => {
        if (err) throw err
      }
    )

    // Copy renamed metadata json to the output directory
    fs.copyFile(
      path.join(config.paths.input.metadataJson, `${orderedTokenId}.json`),
      path.join(config.paths.output.metadataJson, `${newTokenId}.json`),
      (err) => {
        if (err) throw err
      }
    )
  })
})()
