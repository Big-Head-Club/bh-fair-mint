import fs from 'fs'
import { getProvenanceHash } from '../index.js'
import { config } from '../config.js'

/**
 * Init - Gets a provenance hash for the metadata images in the input directory,
 * logging each image's individual token id and hash to the shuffle log, and
 * writes the final provenance hash to output.
 */
;(function init() {
  const metadataImagesPath = config.paths.input.metadataImages

  // Get provenance hash, logging each file's hash to the shuffle log
  console.log(`Generating a provenance hash for ${metadataImagesPath}...`)
  const provenanceHash = getProvenanceHash(metadataImagesPath)

  // Write provenance hash to output
  const provenanceHashOutputPath = config.paths.output.provenanceHash
  fs.writeFileSync(provenanceHashOutputPath, provenanceHash)
  console.log(
    `Provenance hash ${provenanceHash} written to ${provenanceHashOutputPath}.`
  )
})()
