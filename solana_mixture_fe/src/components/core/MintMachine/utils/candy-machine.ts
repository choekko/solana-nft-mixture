import * as anchor from '@project-serum/anchor';
import { CANDY_MACHINE_PROGRAM, MIXTURE_MACHINE_PROGRAM } from 'components/core/MintMachine/const/candy';
import { CandyMachineInfo } from 'components/core/MintMachine/types/candy';

export const getCandyMachineId = (type?: string): anchor.web3.PublicKey | undefined => {
  try {
    let machineId;
    if (type === 'mixture') {
      machineId = new anchor.web3.PublicKey('5qboT7jgnuWNQvSShNKegNbKwzAGkJohhYdZcHdbqUxW');
    } else {
      machineId = new anchor.web3.PublicKey(process.env.REACT_APP_CANDY_MACHINE_ID!);
    }

    return machineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

export const getCandyMachineCreator = async (
  candyMachine: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from('candy_machine'), candyMachine.toBuffer()],
    CANDY_MACHINE_PROGRAM,
  );
};

// 캔디머신을 불러오는 걸까?
export const getCandyMachineState = async (
  anchorWallet: anchor.Wallet,
  candyMachineId: anchor.web3.PublicKey,
  connection: anchor.web3.Connection,
): Promise<CandyMachineInfo> => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: 'finalized',
  });
  const idl = await anchor.Program.fetchIdl(CANDY_MACHINE_PROGRAM, provider);
  const program = new anchor.Program(idl!, CANDY_MACHINE_PROGRAM, provider);
  const state: any = await program.account.candyMachine.fetch(candyMachineId);

  const itemsAvailable = state.data.itemsAvailable.toNumber();
  const itemsRedeemed = state.itemsRedeemed.toNumber();
  const itemsRemaining = itemsAvailable - itemsRedeemed;

  return {
    id: candyMachineId,
    program,
    state: {
      itemsAvailable,
      itemsRedeemed,
      itemsRemaining,
      isSoldOut: itemsRemaining === 0,
      isActive: false,
      isPresale: false,
      isWhitelistOnly: false,
      goLiveDate: state.data.goLiveDate,
      treasury: state.wallet,
      tokenMint: state.tokenMint,
      gatekeeper: state.data.gatekeeper,
      endSettings: state.data.endSettings,
      whitelistMintSettings: state.data.whitelistMintSettings,
      hiddenSettings: state.data.hiddenSettings,
      price: state.data.price,
    },
  };
};

export const getMixMachineState = async (
  anchorWallet: anchor.Wallet,
  candyMachineId: anchor.web3.PublicKey,
  connection: anchor.web3.Connection,
) => {
  const provider = new anchor.Provider(connection, anchorWallet, {
    preflightCommitment: 'confirmed',
  });

  const idl = await anchor.Program.fetchIdl(MIXTURE_MACHINE_PROGRAM, provider);
  const program = new anchor.Program(idl!, MIXTURE_MACHINE_PROGRAM, provider);

  return {
    id: candyMachineId,
    program,
  };
};
