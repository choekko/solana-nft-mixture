## Solana Composable NFT Uploader
`uploader` is a API to uploading Composable NFTs to the Arweave storage for use with the Mixture Machine.
This tool is only for Solana devnet now.

### Prerequisites
Please install or have installed the following:
- nodejs and npm
- typescript
- babel
- express
- @project-serum/anchor
- @solana/web3.js
- @metaplex/arweave-cost
- [solana-cli](https://docs.solana.com/cli/install-solana-cli-tools)

Or you can follow:
- Clone it Into A Folder.
- Install The Dependencies.(ex.cd solana-nft-upload npm install)

Please create solana keypair using solana-cli:
- `solana-keygen new --outfile {KEYPAIR_NAME}.json` (need to run this command in a project home directory)

and set the solana config:
- `solana config set --keypair PROJECT_DIRECTORY/{KEYPAIR_NAME}.json`

Set your environment variables(.env file):
- Set your ASSETS folder path, and KEYPAIR path environment variables.

You'll also need some SOL. You can get SOL into your generated wallet by using `solana airdrop` command.

### Start
- Start Up The Server With `npm run start`
- A server could be run with port 8082.

### API Request
- Call POST request with following request body data:
- 'metadata' field is compatible with metaplex [metadata standard](https://docs.metaplex.com/token-metadata/Versions/v1.0.0/nft-standard).
- We only support .png type for image now.
```
{
    "metadata" : {
         "name": "NFT NAME",
        "symbol": "NFT SYMBOL",
        "description": "NFT DESCRIPTION",
        "image": "{IMAGE_NAME}.{png}",
        "properties": {
        "files": [
            {
            "uri": "{IMAGE_NAME}.{png}",
            "type": "image/png"
            }
        ],
        "creators": [
            {
            "address": "{BASE58 ENCODED NFT CREATOR ACCOUNT ADDRESS}",
            "share": {NUMBER}
            }
        ],
        "children" : [
            {
            "pubkeys": [{BASE58 ENCODED CHILDREN TOKEN ACCOUNT ADDRESS}]
            }
        ]
        }
    },
    "network": "devnet",
    "composableNFTIndex": {IMAGE_NAME},
    "parentNFT": "{BASE58 ENCODED NFT ACCOUNT ADDRESS NEED TO BE COMPOSED}"
}
```
- you need to generate key pair for composable nft before call this API.