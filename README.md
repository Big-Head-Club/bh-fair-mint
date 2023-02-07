# Fair Minting

This is just an experiment, nothing to see here, here be dragons.

## Example

```
npm run example
```

## How To

### Provenance Hash

To generate a provenance hash for the metadata images, first place the images in the directory specified in `config.paths.input.metadataImages` and update the `config.tokenIdsBeginAt` variable (generally either 0 or 1). Then run:

```
npm run provenance-hash
```

This command will output a provenance hash to the file specified in `config.paths.output.provenanceHash` and a json file containing the token id's and their associated image hashes (the "shuffle log").

### Shuffling Metadata

Ensure your image and json metadata are in the directories specified in `config.js` and that you have already run the `npm run provenance-hash` command for these images. Then:

```
npm run shuffle-metadata
```

This command will output the shuffled metadata into the output directories specified in `config.js`, as well as record which token id was transformed into which new token id in the shuffle log.

### Verification

To verify a directory of metadata images was shuffled properly according to the block hash, ensure the images are in the `verifyImages` directory specified in `config.js`, and also specify the `blockHash` that was used in the shuffle and the `provenanceHash` you wish to verify. Then run:

```
npm run verify
```

Which outputs to the console `Shuffle verified: true|false`.
