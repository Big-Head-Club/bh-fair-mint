import fs from 'fs'
import path from 'path'
import {
  getOrderedTokenIds,
  getBlockHash,
  getShuffledTokenIds,
  getShuffleLog,
  getTokenIdAtIndex,
  setShuffleLog,
} from '../index.js'
import { config } from '../config.js'

/**
 * Init - Derives the random indices required by the Fisher-Yates shuffle from
 * the block hash, calculates a shuffled array of token id's, updates the
 * shuffle log with the new token id for each original id, then copies and
 * renames each (shuffled) metadata token image and json to output.
 *
 * @todo - Metadata json files may each need their `image` property updated
 * with the new post-shuffle token id.
 */
;(function init() {
  const orderedTokenIds = getOrderedTokenIds()
  const shuffledTokenIds = getShuffledTokenIds(
    getOrderedTokenIds(),
    getBlockHash()
  )
  const shuffleLog = getShuffleLog()

  // For each token, set its `newToken` property in shuffle log
  shuffledTokenIds.forEach((shuffledTokenId, i) => {
    const orderedTokenId = getTokenIdAtIndex(i)

    shuffleLog[orderedTokenId].newTokenId = shuffledTokenId

    setShuffleLog(shuffleLog)
  })

  // For each token, output reordered (renamed) metadata images and json
  orderedTokenIds.forEach((orderedTokenId) => {
    const newTokenId = shuffleLog[orderedTokenId].newTokenId

    // Copy renamed metadata image to output
    fs.copyFile(
      path.join(config.paths.input.metadataImages, `${orderedTokenId}.png`),
      path.join(config.paths.output.metadataImages, `${newTokenId}.png`),
      (err) => {
        if (err) throw err
      }
    )

    // Copy renamed metadata json to output
    fs.copyFile(
      path.join(config.paths.input.metadataJson, `${orderedTokenId}.json`),
      path.join(config.paths.output.metadataJson, `${newTokenId}.json`),
      (err) => {
        if (err) throw err
      }
    )
  })
})()
