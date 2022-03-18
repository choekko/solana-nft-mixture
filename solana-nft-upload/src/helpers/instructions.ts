import {
    PublicKey,
    SystemProgram,
    SYSVAR_RENT_PUBKEY,
    TransactionInstruction,
  } from '@solana/web3.js';
  import {
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    TOKEN_METADATA_PROGRAM_ID,
    CONFIG_ARRAY_START_V2,
    MIXTURE_PROGRAM_ID,
    CONFIG_LINE_SIZE_V2,
  } from './constants';
  import * as anchor from '@project-serum/anchor';
  import { MixtureData } from './accounts';
import { Program } from '@project-serum/anchor';
  
 
  export function createMetadataInstruction(
    metadataAccount: PublicKey,
    mint: PublicKey,
    mintAuthority: PublicKey,
    payer: PublicKey,
    updateAuthority: PublicKey,
    txnData: Buffer,
  ) {
    const keys = [
      {
        pubkey: metadataAccount,
        isSigner: false,
        isWritable: true,
      },
      {
        pubkey: mint,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: mintAuthority,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: payer,
        isSigner: true,
        isWritable: false,
      },
      {
        pubkey: updateAuthority,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SystemProgram.programId,
        isSigner: false,
        isWritable: false,
      },
      {
        pubkey: SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
    ];
    return new TransactionInstruction({
      keys,
      programId: TOKEN_METADATA_PROGRAM_ID,
      data: txnData,
    });
  }
    
  export async function createMixtureAccount(
    anchorProgram: Program,
    mixtureData: MixtureData,
    payerWallet: PublicKey,
    mixtureAccount: any,
  ) {
    const size =
    CONFIG_ARRAY_START_V2 +
    4 +
    1* CONFIG_LINE_SIZE_V2 +
    8 +
    2 * (Math.floor(1 / 8) + 1);

    return anchor.web3.SystemProgram.createAccount({
      fromPubkey: payerWallet,
      newAccountPubkey: mixtureAccount,
      space: size,
      lamports:
        await anchorProgram.provider.connection.getMinimumBalanceForRentExemption(
          size,
        ),
      programId: MIXTURE_PROGRAM_ID,
    });
  }
  