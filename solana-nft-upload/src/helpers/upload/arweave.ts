import * as anchor from '@project-serum/anchor';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { stat } from 'fs/promises';
import { calculate } from '@metaplex/arweave-cost';
import { ARWEAVE_PAYMENT_WALLET } from '../constants';
import { sendTransactionWithRetryWithKeypair } from '../transactions';
import { Program } from '@project-serum/anchor';

const ARWEAVE_UPLOAD_ENDPOINT =
  'https://us-central1-metaplex-studios.cloudfunctions.net/uploadFile';

async function fetchAssetCostToStore(fileSizes: number[]) {
  const result = await calculate(fileSizes);
  console.log('Arweave cost estimates:', result);

  return result.solana * anchor.web3.LAMPORTS_PER_SOL;
}

async function upload(data: FormData, manifest:any, index:number) {
  console.log(`trying to upload image ${index}: ${manifest.name}`);
  return await (
    await fetch(ARWEAVE_UPLOAD_ENDPOINT, {
      method: 'POST',
      // @ts-ignore
      body: data,
    })
  ).json();
}

function estimateManifestSize(filenames: string[]) {

  const paths: any = {
  };

  for (const name of filenames) {
    paths[name] = {
      id: 'artestaD_testsEaEmAGFtestEGtestmMGmgMGAV438',
      ext: path.extname(name).replace('.', ''),
    };
  }

  const manifest = {
    manifest: 'arweave/paths',
    version: '0.1.0',
    paths,
    index: {
      path: 'metadata.json',
    },
  };

  const data = Buffer.from(JSON.stringify(manifest), 'utf8');
  console.log('Estimated manifest size:', data.length);
  return data.length;
}

export async function arweaveUpload(
  walletKeyPair:anchor.web3.Keypair,
  anchorProgram:Program,
  env:string,
  image:any, // 이미지 경로를 넣는다.
  manifestBuffer:any,
  manifest:any,
  index:number, // 이미지 이름(숫자)
) {
  console.log("image in arweaveUpload:", image);
  const imageExt = path.extname(image);
  const fsStat = await stat(image);
  const estimatedManifestSize = estimateManifestSize([
    `${index}${imageExt}`,
    'metadata.json',
  ]);
  const storageCost = await fetchAssetCostToStore([
    fsStat.size,
    manifestBuffer.length,
    estimatedManifestSize,
  ]);
  console.log(`lamport cost to store ${image}: ${storageCost}`);

  const instructions = [
    anchor.web3.SystemProgram.transfer({
      fromPubkey: walletKeyPair.publicKey,
      toPubkey: ARWEAVE_PAYMENT_WALLET,
      lamports: storageCost,
    }),
  ];

  const tx = await sendTransactionWithRetryWithKeypair(
    anchorProgram.provider.connection,
    walletKeyPair,
    instructions,
    [],
    'confirmed',
  );
  console.log(`solana transaction (${env}) for arweave payment:`, tx);
  console.log("mainifest buffer : ", manifestBuffer.toString());
  const data = new FormData();
  data.append('transaction', tx['txid']);
  data.append('env', env);
  data.append('file[]', fs.createReadStream(image), {
    filename: `${index}${imageExt}`,
    contentType: `image/${imageExt.replace('.', '')}`,
  });
  data.append('file[]', manifestBuffer, 'metadata.json');
  const result = await upload(data, manifest, index);
  console.log("result : ", result);
  const metadataFile = result.messages?.find(
    (m:any) => m.filename === 'manifest.json',
  );
  const imageFile = result.messages?.find(
    (m:any) => m.filename === `${index}${imageExt}`,
  );
  if (metadataFile?.transactionId) {
    const link = `https://arweave.net/${metadataFile.transactionId}`;
    const imageLink = `https://arweave.net/${
      imageFile.transactionId
    }?ext=${imageExt.replace('.', '')}`;
    console.log(`File uploaded: ${link}`);
    return [link, imageLink]; // json이랑 image 따로 리턴
  } else {
    // @todo improve
    throw new Error(`No transaction ID for upload: ${index}`);
  }
}
