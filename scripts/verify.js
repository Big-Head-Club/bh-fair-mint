import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
import {
  removeDotGitignore,
  unshuffleArray,
  getRandomIndicesFromBlockHash,
  getOrderedTokenIds,
  getBlockHash,
  getImageHash,
} from '../index.js'
import { config } from '../config.js'

/**
 * Init - Verifies the shuffle by first unshuffling the images in the verify
 * images directory (reversing the shuffle based on the block hash specified in
 * the config), then calculates a new provenance hash of the resulting ordered
 * images, and checks it against the provenance hash in the config, logging the
 * result to the console.
 */
;(function init() {
  const shuffledMetadataImages = removeDotGitignore(
    fs.readdirSync(config.paths.input.verifyImages)
  )
  const unshuffledMetadataImages = unshuffleArray(
    [...shuffledMetadataImages],
    getRandomIndicesFromBlockHash(getOrderedTokenIds(), getBlockHash())
  )

  // Calculate a new provenance hash based on the unshuffled metadata images
  let concatenatedHashes = ''

  unshuffledMetadataImages.forEach((image) => {
    const imageHash = getImageHash(
      path.join(config.paths.input.verifyImages, image)
    )

    concatenatedHashes += imageHash
  })

  const calculatedProvenanceHash = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(concatenatedHashes))
    .substring(2) // Omit '0x' prefix

  console.log(
    'Shuffle verified:',
    calculatedProvenanceHash === config.provenanceHashToVerify
  )
})()
