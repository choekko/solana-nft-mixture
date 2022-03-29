import * as anchor from '@project-serum/anchor';
import { getAtaForMint } from 'components/core/MintMachine/utils/solana';
import { SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import { createApproveInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { sendTransactions } from 'components/core/MintMachine/utils/connection';
import { MixtureMachineInfo } from 'components/core/MixtureMachine/types/mixtureMachine';
import { getMixtureMachineCreator } from 'components/core/MixtureMachine/utils/mixtureMachine';

export const decompose = async (
  mint: anchor.web3.PublicKey,
  mixtureMachineInfo: MixtureMachineInfo,
  childMints: anchor.web3.PublicKey[],
  payer: anchor.web3.PublicKey,
): Promise<(string | undefined)[]> => {
  try {
    const signers: anchor.web3.Keypair[] = [];
    const cleanupInstructions: TransactionInstruction[] = [];
    const instructions = [];
    const transferAuthorityKeypair = anchor.web3.Keypair.generate();
    const mixtureMachineAddress = mixtureMachineInfo.id;

    const [mixtureMachineCreator, creatorBump] = await getMixtureMachineCreator(mixtureMachineAddress, mint);

    const mintAta = (await getAtaForMint(mint, payer))[0];
    const vaultAddressList = await Promise.all(
      childMints.map(async childMint => (await getAtaForMint(childMint, mixtureMachineCreator))[0]),
    );
    const childAtaListForPayer = await Promise.all(
      childMints.map(async childMint => (await getAtaForMint(childMint, payer))[0]),
    );

    signers.push(transferAuthorityKeypair);
    instructions.push(
      createApproveInstruction(mintAta, transferAuthorityKeypair.publicKey, payer, 1, [], TOKEN_PROGRAM_ID),
    );

    const remainingAccounts = childMints.flatMap((childMint, idx) => [
      {
        pubkey: childAtaListForPayer[idx],
        isWritable: true,
        isSigner: false,
      },
      {
        pubkey: vaultAddressList[idx],
        isWritable: true,
        isSigner: false,
      },
    ]);

    instructions.push(
      await mixtureMachineInfo.program.instruction.decomposeNft(creatorBump, {
        accounts: {
          mixtureMachineCreator,
          mixtureMachine: mixtureMachineAddress,
          parentTokenMint: mint,
          parentBurnAuthority: transferAuthorityKeypair.publicKey,
          parentTokenAccount: mintAta,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
          instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts: remainingAccounts,
      }),
    );

    try {
      return (
        await sendTransactions(
          mixtureMachineInfo.program.provider.connection,
          mixtureMachineInfo.program.provider.wallet,
          [instructions, cleanupInstructions],
          [signers, []],
        )
      ).txs.map(t => t.txid);
    } catch (e) {
      console.log(e);
    }
  } catch (e) {
    console.error(e);
  }

  return [];
};
