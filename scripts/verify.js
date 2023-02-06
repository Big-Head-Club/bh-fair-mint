import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
import {
  getOrderedTokenIds,
  getBlockHash,
  unshuffleArray,
  getRandomIndicesFromBlockHash,
  getImageHash,
  removeDotGitignore,
  getTokenIdAtIndex,
} from '../index.js'
import { config } from '../config.js'

/**
 * Init - Verifies the shuffle by first unshuffling the images in the verify
 * images directory (reversing the shuffle based on the block hash), then
 * calculates a new provenance hash of the resulting order of images, and checks
 * it against the provenance hash in the input directory.
 */
;(function init() {
  const provenanceHash = config.provenanceHashToVerify
  const orderedTokenIds = getOrderedTokenIds()
  const blockHash = getBlockHash()
  const shuffledMetadataImages = removeDotGitignore(
    fs.readdirSync(config.paths.input.verifyImages)
  )
  console.log('shuffledMetadataImages', shuffledMetadataImages)
  const unshuffledMetadataImages = unshuffleArray(
    shuffledMetadataImages,
    getRandomIndicesFromBlockHash(orderedTokenIds, blockHash)
  )
  console.log('unshuffledMetadataImages', unshuffledMetadataImages)

  // Calculate a new provenance hash based on the unshuffled metadata images
  let concatenatedHashes = ''

  unshuffledMetadataImages.forEach((image) => {
    const imageHash = getImageHash(
      path.join(config.paths.input.verifyImages, image)
    )

    console.log(`${image}: ${imageHash}`)

    concatenatedHashes += imageHash
  })

  const calculatedProvenanceHash = ethers.utils
    .keccak256(ethers.utils.toUtf8Bytes(concatenatedHashes))
    .substring(2) // Omit '0x' prefix

  console.log('Verified:', provenanceHash == calculatedProvenanceHash)
})()
