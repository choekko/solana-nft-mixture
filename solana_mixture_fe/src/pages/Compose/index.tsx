/** @jsxImportSource @emotion/react */

import * as anchor from '@project-serum/anchor';
import TitleBox from 'components/TitleBox';
import Inventory, { ReagentNftData } from 'pages/Compose/Inventory';
import { css, Theme } from '@emotion/react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import ReagentCard from 'pages/Compose/ReagentCard';
import { useWalletNfts } from '@nfteyez/sol-rayz-react';
import { getCandyMachineCreator, getCandyMachineId } from 'components/core/MintMachine/utils/candy-machine';
import { MetaData } from 'components/core/MixtureMachine/types/metaData';
import axios from 'axios';
import ComposeMachine from 'components/core/MixtureMachine/ComposeMachine';

const Compose = () => {
  const wallet = useWallet();
  const [isComposing, setIsComposing] = useState(false);
  const [leftReagent, setLeftReagent] = useState<ReagentNftData | undefined>(undefined);
  const [rightReagent, setRightReagent] = useState<ReagentNftData | undefined>(undefined);
  const [reagentNftsData, setReagentNftsData] = useState<ReagentNftData[]>([]);
  const { connection } = useConnection();
  const { nfts, isLoading } = useWalletNfts({
    publicAddress: wallet?.publicKey?.toString() ?? '',
    connection,
  });
  const [candyMachineCreator, setCandyMachineCreator] = useState('');

  const isProcessing = useMemo(() => isComposing || isLoading, [isComposing, isLoading]);

  const fetchCandyMachineCreator = async () => {
    const candyMachineCreator = (await getCandyMachineCreator(getCandyMachineId()!))[0].toString();
    setCandyMachineCreator(candyMachineCreator);
  };

  const patchReagentNftsData = useCallback(async () => {
    if (!nfts) return;
    const reagentNftsData = nfts?.filter(
      nft => nft.data.creators[0].address === candyMachineCreator,
    ) as ReagentNftData[];
    try {
      const metaDataList = await Promise.all(
        reagentNftsData.map(reagentNftData => {
          const metadataUrl = reagentNftData.data.uri;
          return getMetaData(metadataUrl);
        }),
      );
      metaDataList.forEach((metaData, idx) => {
        reagentNftsData[idx]['imageUrl'] = metaData.image;
        reagentNftsData[idx]['attributes'] = metaData.attributes;
      });
      console.log(reagentNftsData);
      setReagentNftsData(reagentNftsData);
    } catch (error) {
      console.log(error);
    }
  }, [nfts, candyMachineCreator]);

  const getMetaData = async (metadataUrl: string): Promise<MetaData> => {
    try {
      const response = await axios.get(metadataUrl);
      return response.data;
    } catch (error) {
      throw new Error('getMetaData');
    }
  };

  useEffect(() => {
    (async () => {
      await fetchCandyMachineCreator();
      await patchReagentNftsData();
    })();
  }, [nfts]);

  const callbackAfterReagentClick = (mintAccountAddress: string) => {
    const clickedReagentNftDataIndex = reagentNftsData.findIndex(
      reagentNftData => reagentNftData.mint === mintAccountAddress,
    );
    const clickedReagentNftData = reagentNftsData[clickedReagentNftDataIndex];

    let isClickPossible = false;
    if (clickedReagentNftData.mint === leftReagent?.mint) {
      setLeftReagent(undefined);
      isClickPossible = true;
    }
    if (clickedReagentNftData.mint === rightReagent?.mint) {
      setRightReagent(undefined);
      isClickPossible = true;
    }

    if (!isClickPossible) {
      if (leftReagent && rightReagent) return;
      if (!leftReagent && !isClickPossible) {
        if (
          rightReagent &&
          rightReagent.attributes.some(
            ({ trait_type, value }) =>
              trait_type === 'ElEMENT1' &&
              value === clickedReagentNftData.attributes.find(({ trait_type }) => trait_type === 'Element1').value,
          )
        ) {
          alert('Same Element!');
          return;
        }
        setLeftReagent(clickedReagentNftData);
        isClickPossible = true;
      }
      if (!rightReagent && !isClickPossible) {
        if (
          leftReagent &&
          leftReagent.attributes.some(
            ({ trait_type, value }) =>
              trait_type === 'ElEMENT1' &&
              value === clickedReagentNftData.attributes.find(({ trait_type }) => trait_type === 'Element1').value,
          )
        ) {
          alert('Same Element!');
          return;
        }
        setRightReagent(clickedReagentNftData);
        isClickPossible = true;
      }
    }

    if (isClickPossible) {
      setReagentNftsData(
        reagentNftsData.map(reagentNftData => ({
          ...reagentNftData,
          isClicked:
            reagentNftData.mint === clickedReagentNftData.mint ? !reagentNftData.isClicked : reagentNftData.isClicked,
        })),
      );
    }
  };

  const callbackAfterCompose = () => {
    alert('Complete!\n See your wallet or inventory in Decompose Page');
    window.location.reload();
  };

  const childMints = useMemo(() => {
    const leftMint = leftReagent ? [new anchor.web3.PublicKey(leftReagent.mint)] : [];
    const rightMint = rightReagent ? [new anchor.web3.PublicKey(rightReagent.mint)] : [];
    return [...leftMint, ...rightMint];
  }, [leftReagent, rightReagent]);

  const childrenAttributes = useMemo(() => {
    if (!leftReagent || !rightReagent) return [];
    const leftElement = leftReagent.attributes.find(({ trait_type }) => trait_type === 'Element1').value;
    const rightElement = rightReagent.attributes.find(({ trait_type }) => trait_type === 'Element1').value;

    const attributes = [
      { trait_type: 'Element1', value: leftElement },
      { trait_type: 'Element2', value: rightElement },
      { trait_type: 'Version', value: leftReagent.attributes.find(({ trait_type }) => trait_type === 'Version').value },
    ];
    return attributes;
  }, [leftReagent, rightReagent]);

  return (
    <div css={composeWrapStyle}>
      <TitleBox title="Compose Reagents" subTitle="You can also compose reagents." />
      {!wallet.publicKey && (
        <label css={loginMessageStyle} htmlFor="wallet_btn">
          <span>Please Connect Wallet</span>
        </label>
      )}
      {wallet?.publicKey && (
        <>
          <Inventory
            reagentNftsData={reagentNftsData}
            callbackAfterReagentClick={callbackAfterReagentClick}
            isLoading={isLoading}
            disabled={isProcessing}
          />
          <section css={reagentCardsWrapStyle}>
            <ReagentCard data={leftReagent} callbackAfterClick={callbackAfterReagentClick} disabled={isProcessing} />
            <ReagentCard data={rightReagent} callbackAfterClick={callbackAfterReagentClick} disabled={isProcessing} />
          </section>
          <ComposeMachine
            composeBtnCss={mixtureMachineBtnStyle}
            childMints={childMints}
            childrenAttributes={childrenAttributes}
            minChildMintsNumber={2}
            setIsComposing={setIsComposing}
            isComposing={isComposing}
            isLoading={isLoading}
            callbackAfterCompose={callbackAfterCompose}
          />
        </>
      )}
    </div>
  );
};

const composeWrapStyle = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const reagentCardsWrapStyle = css`
  display: flex;
  width: 100%;
  justify-content: center;
  gap: 60px;
`;

const mixtureMachineBtnStyle = (theme: Theme) => css`
  width: 200px;
  height: 40px;
  font-size: 20px;
  color: ${theme.color.dark};
  background-color: ${theme.color.skyblue};
  margin-top: 20px;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:disabled {
    background-color: ${theme.color.backgroundDark};
  }
`;

const loginMessageStyle = (theme: Theme) => css`
  padding: 20px;
  border: 1px solid #376086;
  border-radius: 20px;
  margin: 30px 0;

  &:hover {
    background-color: ${theme.color.skyblue};
    cursor: pointer;
  }

  & > span {
    font-size: 30px;
    font-weight: bold;
  }
`;

export default Compose;
