import * as anchor from '@project-serum/anchor';
import { MIXTURE_MACHINE_PROGRAM } from 'components/core/MintMachine/const/candy';
import { calculateImageNumber, Element, makeParentMetaData } from 'components/core/MixtureMachine/utils/metaData';
import axios, { AxiosResponse } from 'axios';
import { getAttributeValue } from 'utils/metadata';

interface UploaderResponse {
  status: 'success' | 'fail';
  arweaveLink: string;
  mixture: string;
}

export const getMixtureMachineId = async (
  payer: anchor.web3.PublicKey,
  mint: anchor.web3.PublicKey,
  childMints: anchor.web3.PublicKey[],
  childrenAttributes: Array<{ trait_type: string; value: string }>,
): Promise<anchor.web3.PublicKey> => {
  try {
    const leftElement = getAttributeValue(childrenAttributes, 'Element1');
    const rightElement = getAttributeValue(childrenAttributes, 'Element2');
    if (!leftElement || !rightElement) throw new Error('Attributes error');
    const imageNumber = calculateImageNumber([leftElement as Element, rightElement as Element]);
    if (imageNumber === 0) throw new Error('Attributes error');

    const requestData = makeParentMetaData({
      imageNumber,
      payer,
      parentNftMint: mint,
      childNftMints: childMints,
      childrenAttributes,
    });

    const response: AxiosResponse<UploaderResponse> = await axios.post('http://54.180.95.41:8082/upload', requestData);
    console.log('upload response::', response);
    if (response.data.status === 'fail') {
      throw new Error('upload fail');
    }
    return new anchor.web3.PublicKey(response.data.mixture);

    // return new anchor.web3.PublicKey('5qboT7jgnuWNQvSShNKegNbKwzAGkJohhYdZcHdbqUxW');
  } catch (e) {
    throw new Error('Failed to construct MixtureMachine [업로더 실패]');
  }
};

export const getMixtureMachineState = async (
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
    // state는 안넣음
  };
};

export const getMixtureMachineCreator = async (
  mixtureMachine?: anchor.web3.PublicKey,
): Promise<[anchor.web3.PublicKey, number]> => {
  return await anchor.web3.PublicKey.findProgramAddress(
    mixtureMachine ? [Buffer.from('mixture_machine'), mixtureMachine.toBuffer()] : [Buffer.from('mixture_machine')],
    MIXTURE_MACHINE_PROGRAM,
  );
};
