import * as anchor from '@project-serum/anchor';
import { getAtaForMint } from 'components/core/MintMachine/utils/solana';
import { SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionInstruction } from '@solana/web3.js';
import {
  createApproveInstruction,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { getMetadata } from 'components/core/MintMachine/utils/metaplex';
import { TOKEN_METADATA_PROGRAM_ID } from 'components/core/MintMachine/const/candy';
import { sendTransactions } from 'components/core/MintMachine/utils/connection';
import { MixtureMachineInfo } from 'components/core/MixtureMachine/types/mixtureMachine';
import { getMixtureMachineCreator } from 'components/core/MixtureMachine/utils/mixtureMachine';

export const compose = async (
  newMintKeyPair: anchor.web3.Keypair,
  mixtureMachineInfo: MixtureMachineInfo,
  payer: anchor.web3.PublicKey, // 지갑 주소
  childMints: anchor.web3.PublicKey[],
): Promise<(string | undefined)[]> => {
  try {
    const mixtureMachineAddress = mixtureMachineInfo.id;

    const mint = newMintKeyPair;
    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0];

    const signers: anchor.web3.Keypair[] = [mint]; // signers는 아래 instructions와 1:1 매칭이라고 생각하면 좋아.
    const cleanupInstructions: TransactionInstruction[] = []; // 가비지 콜렉팅을 위한 친구인 듯

    const instructions = [
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await mixtureMachineInfo.program.provider.connection.getMinimumBalanceForRentExemption(
          MintLayout.span,
        ),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 0, payer, payer, TOKEN_PROGRAM_ID),
      createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, mint.publicKey, TOKEN_PROGRAM_ID),
      createMintToInstruction(mint.publicKey, userTokenAccountAddress, payer, 1, [], TOKEN_PROGRAM_ID),
    ]; // ------- signer : mint

    const [mixtureMachineCreator, creatorBump] = await getMixtureMachineCreator(mixtureMachineAddress);

    const transferAuthorityKeypair = anchor.web3.Keypair.generate();
    const vaultAddressList = await Promise.all(
      childMints.map(async childMint => (await getAtaForMint(childMint, mixtureMachineCreator))[0]),
    );
    const childAtaList = await Promise.all(
      childMints.map(async childMint => (await getAtaForMint(childMint, payer))[0]),
    );

    const remainingAccounts = childMints.flatMap((childMint, idx) => [
      {
        pubkey: transferAuthorityKeypair.publicKey,
        isWritable: true,
        isSigner: true,
      },
      {
        pubkey: childMint,
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: childAtaList[idx],
        isWritable: false,
        isSigner: false,
      },
      {
        pubkey: vaultAddressList[idx],
        isWritable: true,
        isSigner: false,
      },
    ]);

    signers.push(transferAuthorityKeypair);

    vaultAddressList.forEach((vaultAddress, idx) =>
      instructions.push(
        createAssociatedTokenAccountInstruction(
          payer,
          vaultAddress,
          mixtureMachineCreator,
          childMints[idx],
          TOKEN_PROGRAM_ID,
        ),
      ),
    );

    childAtaList.forEach(childAta =>
      instructions.push(
        createApproveInstruction(childAta, transferAuthorityKeypair.publicKey, payer, 1, [], TOKEN_PROGRAM_ID),
      ),
    );

    const metadataAddress = await getMetadata(mint.publicKey);

    instructions.push(
      await mixtureMachineInfo.program.instruction.composeNft(creatorBump, {
        accounts: {
          mixtureMachine: mixtureMachineAddress,
          mixtureMachineCreator: mixtureMachineCreator,
          payer: payer,
          metadata: metadataAddress,
          mint: mint.publicKey,
          mintAuthority: payer,
          updateAuthority: payer,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
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
