/** @jsxImportSource @emotion/react */
import * as anchor from '@project-serum/anchor';
import { getCandyMachineId, getCandyMachineState } from 'components/core/MintMachine/utils/candy-machine';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CandyMachineInfo } from 'components/core/MintMachine/types/candy';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { mintOneToken } from 'components/core/MintMachine/utils/mint';
import { awaitTransactionSignatureConfirmation } from 'components/core/MintMachine/utils/connection';
import { css } from '@emotion/react';
window.Buffer = window.Buffer || require('buffer').Buffer;

interface MintMachineProps {
  mintTxt?: string;
}

const MintMachine = ({ mintTxt = 'Mint' }: MintMachineProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachineInfo, setCandyMachineInfo] = useState<CandyMachineInfo>();
  const [isActive, setIsActive] = useState(false);
  const [itemsRemaining, setItemsRemaining] = useState<number>();

  const candyMachineId = useMemo(() => getCandyMachineId(), []);
  const { connection } = useConnection();
  const txTimeoutInMilliseconds = 15000;

  const wallet = useWallet();

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

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet || !candyMachineId) {
      return;
    }

    let active = true;

    try {
      const candyMachineInfo = await getCandyMachineState(anchorWallet, candyMachineId, connection);

      setItemsRemaining(candyMachineInfo.state.itemsRemaining);

      if (candyMachineInfo.state.endSettings?.endSettingType.amount) {
        const limit = Math.min(
          candyMachineInfo.state.endSettings.number.toNumber(),
          candyMachineInfo.state.itemsAvailable,
        );
        if (candyMachineInfo.state.itemsRedeemed < limit) {
          setItemsRemaining(limit - candyMachineInfo.state.itemsRedeemed);
        } else {
          setItemsRemaining(0);
          candyMachineInfo.state.isSoldOut = true;
        }
      }
      if (candyMachineInfo.state.isSoldOut) {
        active = false;
      }

      setIsActive((candyMachineInfo.state.isActive = active));
      setCandyMachineInfo(candyMachineInfo);
    } catch (error) {
      console.error(error);
      throw new Error('캔디머신 상태 동기화 실패');
    }
  }, [wallet, candyMachineId, connection]);

  const handleMintBtnClick = async () => {
    try {
      setIsUserMinting(true);

      if (wallet.connected && candyMachineInfo?.program && wallet.publicKey) {
        const mintTxId = (await mintOneToken(candyMachineInfo, wallet.publicKey))[0];

        let status: any = { err: true };
        if (mintTxId) {
          status = await awaitTransactionSignatureConfirmation(mintTxId, txTimeoutInMilliseconds, connection, true);
        }

        if (status && !status.err) {
          // manual update since the refresh might not detect
          // the change immediately
          let remaining = itemsRemaining! - 1;
          setItemsRemaining(remaining);
          setIsActive((candyMachineInfo.state.isActive = remaining > 0));
          candyMachineInfo.state.isSoldOut = remaining === 0;
          alert('Mint succeeded!\nCheck your wallet or inventory in Compose Page (on devnet)');
        } else {
          alert('Mint failed! Please try again!\n (Check your funds on devnet');
        }
      }
    } catch (error: any) {
      let message = error.msg || 'Minting failed! Please try again!';
      if (!error.msg) {
        if (!error.message) {
          message = 'Transaction Timeout! Please try again.';
        } else if (error.message.indexOf('0x137')) {
          message = `SOLD OUT!`;
        } else if (error.message.indexOf('0x135')) {
          message = `Insufficient funds to mint. Please fund your wallet.`;
        }
      } else {
        if (error.code === 311) {
          message = `SOLD OUT!`;
          window.location.reload();
        } else if (error.code === 312) {
          message = `Minting period hasn't started yet.`;
        }
      }
      alert(message);
      refreshCandyMachineState();
    }
    setIsUserMinting(false);
  };

  const renderingTxt = useMemo(() => {
    if (isUserMinting) return 'Minting...';
    if (!anchorWallet) return 'Please Login';
    if (!isActive) return 'Not now';
    return mintTxt;
  }, [isUserMinting, anchorWallet, isActive]);

  useEffect(() => {
    refreshCandyMachineState();
  }, [anchorWallet, connection, candyMachineId, refreshCandyMachineState]);

  return (
    <>
      <button
        css={mintBtnStyle}
        disabled={!isActive || isUserMinting || !wallet.publicKey}
        onClick={handleMintBtnClick}
      >
        {renderingTxt}
        {isActive && !isUserMinting && wallet.publicKey && (
          <>
            <img alt="buy" src={'/assets/icon/coin_dark.png'} />
            0.1
          </>
        )}
      </button>
      <p css={remainingTextStyle}>
        {isActive ? (
          <span style={{ color: '#3DA1FF' }}>{itemsRemaining}</span>
        ) : (
          <span style={{ color: 'gray' }}>0</span>
        )}{' '}
        / {candyMachineInfo?.state.itemsAvailable ?? 0}
      </p>
    </>
  );
};

const mintBtnStyle = css`
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    margin-left: 10px;
    width: 20px;
    height: 20px;
  }
`;

const remainingTextStyle = css`
  margin: 10px 0 0 0;
  text-align: center;
  color: white;
`;

export default MintMachine;
