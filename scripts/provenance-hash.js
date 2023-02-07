import fs from 'fs'
import { config } from '../config.js'
import { getProvenanceHash } from '../index.js'

/**
 * Init - Gets a provenance hash for the metadata images in the input directory,
 * logging each image's original token id and hash to the shuffle log, and
 * then writes the final provenance hash to the output directory.
 */
;(function init() {
  // Get provenance hash, logging each image's original token id and hash to the shuffle log
  console.log(
    `Generating a provenance hash for ${config.paths.input.metadataImages}...`
  )
  const provenanceHash = getProvenanceHash(config.paths.input.metadataImages)

  // Write provenance hash to the output directory
  fs.writeFileSync(config.paths.output.provenanceHash, provenanceHash)
  console.log(
    `Provenance hash ${provenanceHash} written to ${config.paths.output.provenanceHash}.`
  )
})()
