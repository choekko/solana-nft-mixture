/** @jsxImportSource @emotion/react */

import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import * as anchor from '@project-serum/anchor';
import { awaitTransactionSignatureConfirmation } from 'components/core/MintMachine/utils/connection';
import { getMixtureMachineId, getMixtureMachineState } from 'components/core/MixtureMachine/utils/mixtureMachine';
import { compose } from 'components/core/MixtureMachine/utils/compose';
import { SerializedStyles, Theme } from '@emotion/react';
import { BallTriangle } from 'react-loader-spinner';
import theme from 'styles/theme';

interface ComposeMachineProps {
  childMints: anchor.web3.PublicKey[];
  childrenAttributes: Array<{ trait_type: string; value: string }>;
  minChildMintsNumber: number;
  setIsComposing?: Dispatch<SetStateAction<boolean>>;
  isComposing?: boolean;
  isLoading?: boolean;
  callbackAfterCompose?: () => void;
  composeBtnCss?: ((theme: Theme) => SerializedStyles) | SerializedStyles;
}

const ComposeMachine = ({
  childMints,
  childrenAttributes,
  minChildMintsNumber,
  composeBtnCss,
  setIsComposing,
  isComposing,
  isLoading,
  callbackAfterCompose,
}: ComposeMachineProps) => {
  const [isComposePossible, setIsComposePossible] = useState(false);
  const [isUsingUploader, setIsUsingUploader] = useState(false);
  const wallet = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (childMints.length === minChildMintsNumber) {
      setIsComposePossible(true);
      return;
    }
    setIsComposePossible(false);
  }, [childMints]);

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
    if (!anchorWallet || !wallet || !wallet.publicKey) return;

    setIsComposing?.(true);

    try {
      const mintKeyPair = anchor.web3.Keypair.generate();
      setIsUsingUploader(true);
      const mixtureMachineId = await getMixtureMachineId(
        wallet.publicKey,
        mintKeyPair.publicKey,
        childMints,
        childrenAttributes,
      );
      setIsUsingUploader(false);
      const mixtureMachineInfo = await getMixtureMachineState(anchorWallet, mixtureMachineId, connection);
      const mintTxId = (await compose(mintKeyPair, mixtureMachineInfo, wallet.publicKey, childMints))[0];
      const txTimeoutInMilliseconds = 15000;

      let status: any = { err: true };
      if (mintTxId) {
        status = await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
      }

      if (status && !status.err) {
        callbackAfterCompose?.();
      } else {
        alert('Compose failed! Please try again!\n(Check your funds on devnet)');
      }
    } catch (error: any) {
      let message = error.msg || 'Composing failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to compose. Please fund your wallet.`;
        }
      }
      alert(message);
      setIsComposing?.(false);
    }

    setIsComposing?.(false);
  };

  return (
    <button css={composeBtnCss} onClick={handleClick} disabled={!isComposePossible || isComposing}>
      {isLoading || isComposing ? (
        <>
          <BallTriangle ariaLabel="loading-indicator" color={theme.color.skyblue} width={20} height={20} />
          {isComposing && (
            <span style={{ color: theme.color.skyblue, marginLeft: '10px' }}>
              {isUsingUploader ? 'Checking...' : 'Composing...'}
            </span>
          )}
        </>
      ) : (
        'Compose'
      )}
    </button>
  );
};

export default ComposeMachine;
