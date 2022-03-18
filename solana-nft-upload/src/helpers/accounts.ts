import {
    Keypair,
    PublicKey,
    SystemProgram,
    AccountInfo,
  } from '@solana/web3.js';
import {
  MIXTURE_PROGRAM_ID,
} from './constants';
import * as anchor from '@project-serum/anchor';
import fs from 'fs';
import {
  createMixtureAccount,
} from './instructions';
import { web3 } from '@project-serum/anchor';
import { getCluster } from './various';

export type AccountAndPubkey = {
  pubkey: string;
  account: AccountInfo<Buffer>;
};

export type StringPublicKey = string;



export enum WhitelistMintMode { // TODO : 삭제예정
  BurnEveryTime,
  NeverBurn,
}
export interface MixtureData {
  // itemsAvailable: anchor.BN;
  // symbol: string;
  // sellerFeeBasisPoints: number;
  // isMutable: boolean;
  // price: anchor.BN;
  // retainAuthority: boolean;
  // gatekeeper: null | {
  //   expireOnUse: boolean;
  //   gatekeeperNetwork: web3.PublicKey;
  // };
  // goLiveDate: null | anchor.BN;
  // endSettings: null | [number, anchor.BN];
  // whitelistMintSettings: null | {
  //   mode: WhitelistMintMode;
  //   mint: anchor.web3.PublicKey;
  //   presale: boolean;
  //   discountPrice: null | anchor.BN;
  // };
  // hiddenSettings: null | {
  //   name: string;
  //   uri: string;
  //   hash: Uint8Array;
  // };

  uuid:null|string;
  name:string;
  uri:string;
  symbol: string;
  creators: {
    address: PublicKey;
    verified: boolean;
    share: number;
  }[];
}
  
  export const createMixture = async function (
    anchorProgram: anchor.Program,
    payerWallet: Keypair,
    parentTokenPubkey: PublicKey,
    mixtureData: MixtureData
  ) {
    const seed = parentTokenPubkey.toBytes().slice(0, 32);
    const mixtureAccount = Keypair.fromSeed(seed); 
    let uuid = uuidFromConfigPubkey(mixtureAccount.publicKey);
    mixtureData.uuid = uuid;
    const totalShare = (mixtureData.creators || []).reduce(
      (acc, curr) => acc + curr.share,
      0,
    );

    if (totalShare !== 100) {
      throw new Error(`Invalid config, creators shares must add up to 100`);
    }  
    return {
      mixtureMachine: mixtureAccount.publicKey,
      uuid: uuid,
      txId: await anchorProgram.rpc.initializeMixtureMachine(mixtureData, {
        accounts: {
          mixtureMachine: mixtureAccount.publicKey, 
          authority: payerWallet.publicKey,
          payer: payerWallet.publicKey,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        },
        signers: [payerWallet, mixtureAccount],
        instructions: [
          await createMixtureAccount(
            anchorProgram,
            mixtureData,
            payerWallet.publicKey,
            mixtureAccount.publicKey,
          ),], 
        }),
    };
  };
    
export function uuidFromConfigPubkey(configAccount: PublicKey) {
    return configAccount.toBase58().slice(0, 6);
  }
    
  
export function loadWalletKey(keypair:any): Keypair {
    if (!keypair || keypair == '') {
      throw new Error('Keypair is required!');
    }
    const loaded = Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypair).toString())),
    );
    console.log(`wallet public key: ${loaded.publicKey}`);
    return loaded;
  }
  
export async function loadMixtureProgram(
  walletKeyPair: Keypair,
  env: string,
) { 
  // @ts-ignore
  const solConnection = new anchor.web3.Connection(
    //@ts-ignore
    getCluster(env),
  );

  const walletWrapper = new anchor.Wallet(walletKeyPair);
  const provider = new anchor.Provider(solConnection, walletWrapper, {
    preflightCommitment: 'recent',
  });
  const idl = await anchor.Program.fetchIdl(
    MIXTURE_PROGRAM_ID,
    provider,
  );
  const program = new anchor.Program(
    idl as anchor.Idl,
    MIXTURE_PROGRAM_ID,
    provider,
  );
  console.log('program id from anchor', program.programId.toBase58());
  return program;
}