#!/usr/bin/env ts-node
import * as fs from 'fs';
import {
  CACHE_PATH,
} from './helpers/constants';
import {
  loadMixtureProgram,
  loadWalletKey,
} from './helpers/accounts';
import { uploadArweave } from './commands/upload';

const supportedImageTypes = {
  'image/png': 1,
  'image/gif': 1,
  'image/jpeg': 1,
};

export async function ComposableNFTUpload(
    metadata:string,//json
    keypair:any, // solana keypair 주소
    env:string,
    mintIndex: number, // 합성할 nft 이름(숫자),
    parentTokenAddress:string
): Promise<{ 
    status: string; 
    arweaveLink: string; 
    mixture: string; }>
    {
    if (!fs.existsSync(CACHE_PATH)) {
      fs.mkdirSync(CACHE_PATH);
    }
    console.log("parentTokenAddress : ", parentTokenAddress);
    const cacheName = 'temp';
    const walletKeyPair = loadWalletKey(keypair);
    const mixtureProgram = await loadMixtureProgram(walletKeyPair, env);
    return await uploadArweave({
      metadata,
      cacheName,
      env,
      walletKeyPair,
      mixtureProgram,
      mintIndex,
      parentTokenAddress
    }).then((result) => {
      console.log("uploadArweave result:", result);
      return result;
      });
 }