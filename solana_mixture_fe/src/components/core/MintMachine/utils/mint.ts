// 민트를 시작해보자
import * as anchor from '@project-serum/anchor';
import {
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  MintLayout,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { SystemProgram, SYSVAR_SLOT_HASHES_PUBKEY, TransactionInstruction } from '@solana/web3.js';

import { getAtaForMint } from 'components/core/MintMachine/utils/solana';
import { CandyMachineInfo } from 'components/core/MintMachine/types/candy';
import { TOKEN_METADATA_PROGRAM_ID } from 'components/core/MintMachine/const/candy';
import { getCandyMachineCreator } from 'components/core/MintMachine/utils/candy-machine';
import { sendTransactions } from 'components/core/MintMachine/utils/connection';
import { getMasterEdition, getMetadata } from 'components/core/MintMachine/utils/metaplex';

export const mintOneToken = async (
  candyMachineInfo: CandyMachineInfo,
  payer: anchor.web3.PublicKey, // 지갑 주소
): Promise<(string | undefined)[]> => {
  try {
    const mint = anchor.web3.Keypair.generate(); // 아마 랜덤 키쌍을 만드는 거겠지?

    const userTokenAccountAddress = (await getAtaForMint(mint.publicKey, payer))[0];

    const candyMachineAddress = candyMachineInfo.id;
    const signers: anchor.web3.Keypair[] = [mint]; // signers는 아래 instructions와 1:1 매칭이라고 생각하면 좋아.
    const cleanupInstructions: TransactionInstruction[] = []; // 가비지 콜렉팅을 위한 친구인 듯

    const instructions = [
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: payer,
        newAccountPubkey: mint.publicKey,
        space: MintLayout.span,
        lamports: await candyMachineInfo.program.provider.connection.getMinimumBalanceForRentExemption(MintLayout.span),
        programId: TOKEN_PROGRAM_ID,
      }),
      createInitializeMintInstruction(mint.publicKey, 0, payer, payer, TOKEN_PROGRAM_ID),
      createAssociatedTokenAccountInstruction(payer, userTokenAccountAddress, payer, mint.publicKey, TOKEN_PROGRAM_ID),
      createMintToInstruction(mint.publicKey, userTokenAccountAddress, payer, 1, [], TOKEN_PROGRAM_ID),
    ]; // ------- signer : mint

    const metadataAddress = await getMetadata(mint.publicKey);
    const masterEdition = await getMasterEdition(mint.publicKey);

    const [candyMachineCreator, creatorBump] = await getCandyMachineCreator(candyMachineAddress);

    instructions.push(
      await candyMachineInfo.program.instruction.mintNft(creatorBump, {
        accounts: {
          candyMachine: candyMachineAddress,
          candyMachineCreator,
          payer: payer,
          wallet: candyMachineInfo.state.treasury,
          mint: mint.publicKey,
          metadata: metadataAddress,
          masterEdition,
          mintAuthority: payer,
          updateAuthority: payer,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
          clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
          recentBlockhashes: SYSVAR_SLOT_HASHES_PUBKEY,
          instructionSysvarAccount: anchor.web3.SYSVAR_INSTRUCTIONS_PUBKEY,
        },
        remainingAccounts: undefined,
      }),
    );

    try {
      return (
        await sendTransactions(
          candyMachineInfo.program.provider.connection,
          candyMachineInfo.program.provider.wallet,
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
