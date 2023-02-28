import fs from 'fs'
import path from 'path'
import { ethers } from 'ethers'
import {
  removeDotGitignore,
  readdirSyncOrdered,
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
  // const devRandomIndices = [
  //   8, 22, 14, 84, 58, 1, 63, 55, 98, 44, 97, 51, 13, 25, 66, 10, 12, 89, 26,
  //   59, 8, 16, 11, 38, 82, 77, 86, 47, 13, 6, 4, 86, 44, 66, 28, 83, 9, 40, 2,
  //   94, 99, 37, 31, 20, 16, 18, 73, 2, 6, 30, 36, 69, 41, 86, 65, 48, 37, 38,
  //   26, 9, 66, 35, 6, 34, 33, 91, 29, 42, 8, 48, 53, 52, 12, 29, 17, 33, 85, 68,
  //   86, 35, 97, 62, 69, 44, 27, 91, 47, 27, 32, 18, 21, 32, 48, 91, 25, 45, 6,
  //   41, 76, 27,
  // ]
  // const devShuffledTokenIds = [
  //   77, 12, 65, 88, 27, 2, 35, 83, 1, 89, 81, 93, 69, 91, 58, 11, 73, 19, 68,
  //   10, 78, 84, 6, 87, 70, 64, 96, 3, 14, 56, 5, 71, 17, 61, 29, 45, 60, 28, 24,
  //   26, 72, 57, 32, 21, 51, 90, 30, 85, 82, 31, 37, 23, 98, 79, 86, 8, 38, 39,
  //   50, 20, 74, 80, 97, 67, 76, 55, 15, 43, 9, 52, 54, 53, 13, 47, 18, 34, 33,
  //   95, 48, 36, 42, 63, 25, 62, 4, 99, 59, 100, 94, 75, 22, 66, 49, 92, 40, 46,
  //   7, 16, 44, 41,
  // ]

  const shuffledMetadataImages = removeDotGitignore(
    readdirSyncOrdered(config.paths.input.verifyImages)
  )
  // console.log('shuffledMetadataImages', shuffledMetadataImages)
  // const unshuffledMetadataImages = unshuffleArray(
  //   [...shuffledMetadataImages],
  //   getRandomIndicesFromBlockHash(getOrderedTokenIds(), getBlockHash())
  // )

  const unshuffledMetadataImages = unshuffleArray(
    [...shuffledMetadataImages],
    getRandomIndicesFromBlockHash(getOrderedTokenIds(), getBlockHash())
  )
  //console.log('unshuffledMetadataImages', unshuffledMetadataImages)

  // exit()

  // Calculate a new provenance hash based on the unshuffled metadata images
  let concatenatedHashes = ''

  unshuffledMetadataImages.forEach((image, i) => {
    const imageHash = getImageHash(
      path.join(config.paths.input.verifyImages, image)
    )

    console.log(`${i} ${image}: ${imageHash}`)

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
