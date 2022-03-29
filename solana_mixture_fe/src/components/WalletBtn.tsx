/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { useWalletModal, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState } from 'react';

const WalletBtn = () => {
  const { setVisible } = useWalletModal();
  const { wallet, connect, publicKey } = useWallet();
  const [walletTxt, setWalletTxt] = useState('Wallet');

  const handleMouseLeave = () => {
    setWalletTxt('Wallet');
  };

  const handleMouseEnter = () => {
    setWalletTxt('Phantom');
  };

  useEffect(() => {
    if (!publicKey && wallet) {
      try {
        connect();
      } catch (error) {
        console.log('Error connecting to the wallet: ', (error as any).message);
      }
    }
  }, [wallet]);

  const handleWalletClick = () => {
    try {
      if (!wallet) {
        setVisible(true);
      } else {
        connect();
      }
    } catch (error) {
      console.log('Error connecting to the wallet: ', (error as any).message);
    }
  };

  return (
    <>
      {wallet ? (
        <WalletMultiButton />
      ) : (
        <button
          id="wallet_btn"
          css={WalletBtnCss}
          onClick={handleWalletClick}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
        >
          <img src="/assets/icon/wallet_dark.png" css={{ width: '30px' }} />
          <span> {walletTxt} </span>
        </button>
      )}
    </>
  );
};

const WalletBtnCss = (theme: Theme) => css`
  border-radius: 20px;
  width: 200px;
  height: 50px;
  font-size: 22px;
  font-weight: bold;
  background-color: ${theme.color.skyblue};
  color: ${theme.color.dark};
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding-right: 15px;

  span {
    color: ${theme.color.dark};

    span {
      font-size: 12px;
    }
  }

  &:hover {
    background-color: white;
  }
`;

export default WalletBtn;
