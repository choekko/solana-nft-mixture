import React, { useMemo } from 'react';
import './App.css';
import 'styles/walletStyle.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import Router from '../../routes/Router';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { useMediaQuery } from 'react-responsive';
import Mobile from 'pages/Mobile';

function App() {
  const wallets = [new PhantomWalletAdapter()];

  const network = WalletAdapterNetwork.Devnet;

  // You can also provide a custom RPC endpoint.
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  const isMobile = useMediaQuery({ maxWidth: 1224 });

  if (isMobile) return <Mobile />;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <main className="App">
            <Router />
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
