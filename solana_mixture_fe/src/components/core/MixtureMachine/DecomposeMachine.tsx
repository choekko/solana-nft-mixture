/** @jsxImportSource @emotion/react */

import * as anchor from '@project-serum/anchor';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { SerializedStyles, Theme } from '@emotion/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getMixtureMachineState } from 'components/core/MixtureMachine/utils/mixtureMachine';
import { awaitTransactionSignatureConfirmation } from 'components/core/MintMachine/utils/connection';
import { decompose } from 'components/core/MixtureMachine/utils/decompose';
import { BallTriangle } from 'react-loader-spinner';
import theme from 'styles/theme';

interface DecomposeMachineProps {
  parentMint: anchor.web3.PublicKey | null;
  parentMixtureProgramId: anchor.web3.PublicKey | null;
  childMints: anchor.web3.PublicKey[];
  setIsDecomposing?: Dispatch<SetStateAction<boolean>>;
  isDecomposing?: boolean;
  isLoading?: boolean;
  decomposeBtnCss?: ((theme: Theme) => SerializedStyles) | SerializedStyles;
  callbackAfterDecompose?: () => void;
}

const DecomposeMachine = ({
  parentMint,
  parentMixtureProgramId,
  childMints,
  setIsDecomposing,
  isDecomposing,
  isLoading,
  decomposeBtnCss,
  callbackAfterDecompose,
}: DecomposeMachineProps) => {
  const [isComposePossible, setIsComposePossible] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  console.log(
    parentMint?.toString(),
    parentMixtureProgramId?.toString(),
    childMints.map(child => child.toString()),
  );

  useEffect(() => {
    if (parentMint || parentMixtureProgramId) {
      setIsComposePossible(true);
    }
  });

  const anchorWallet = useMemo(() => {
    if (!wallet || !wallet.publicKey || !wallet.signAllTransactions || !wallet.signTransaction) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const handleClick = async () => {
    if (!anchorWallet || !wallet || !wallet.publicKey || !parentMixtureProgramId || !parentMint) return;

    setIsDecomposing?.(true);

    try {
      const mixtureMachineInfo = await getMixtureMachineState(anchorWallet, parentMixtureProgramId, connection);
      const mintTxId = (await decompose(parentMint, mixtureMachineInfo, childMints, wallet.publicKey))[0];
      const txTimeoutInMilliseconds = 15000;

      if (mintTxId) {
        await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
        callbackAfterDecompose?.();
      }
    } catch (error) {
      setIsDecomposing?.(false);
    }

    setIsDecomposing?.(false);
  };

  return (
    <button css={decomposeBtnCss} onClick={handleClick} disabled={!isComposePossible || isDecomposing || isLoading}>
      {isLoading || isDecomposing ? (
        <>
          <BallTriangle ariaLabel="loading-indicator" color={theme.color.skyblue} width={20} height={20} />
          {isDecomposing && <span style={{ color: theme.color.skyblue, marginLeft: '10px' }}>Composing...</span>}
        </>
      ) : (
        'Decompose'
      )}
    </button>
  );
};

export default DecomposeMachine;
