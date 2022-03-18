/** @jsxImportSource @emotion/react */

import * as anchor from '@project-serum/anchor';
import TitleBox from 'components/TitleBox';
import DecomposeMachine from 'components/core/MixtureMachine/DecomposeMachine';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletNfts } from '@nfteyez/sol-rayz-react';
import Inventory, { ReagentNftData } from 'pages/Compose/Inventory';
import ReagentCard from 'pages/Compose/ReagentCard';
import { css, Theme } from '@emotion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { MetaData } from 'components/core/MixtureMachine/types/metaData';
import axios from 'axios';
import { getAttributeValue } from 'utils/metadata';

const Version = 1;

const Decompose = () => {
  const wallet = useWallet();
  const { connection } = useConnection();
  const { nfts, isLoading } = useWalletNfts({
    publicAddress: wallet?.publicKey?.toString() ?? '',
    connection,
  });
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [reagentNftsData, setReagentNftsData] = useState<ReagentNftData[]>([]);
  const [selectedNftData, setSelectedNftData] = useState<ReagentNftData | undefined>(undefined);
  console.log(nfts);

  const getMetaData = async (metadataUrl: string): Promise<MetaData> => {
    try {
      const response = await axios.get(metadataUrl);
      return response.data;
    } catch (error) {
      throw new Error('getMetaData');
    }
  };

  const patchReagentNftsData = useCallback(async () => {
    if (!nfts) return;
    let reagentNftsData = nfts as ReagentNftData[];
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
        reagentNftsData[idx]['properties'] = metaData.properties;
      });
      console.log(metaDataList);
      reagentNftsData = reagentNftsData.filter(reagentNft => {
        if (Number(getAttributeValue(reagentNft.attributes, 'Version')) !== Version) {
          return false;
        }
        if (!reagentNft.properties.children) {
          return false;
        }
        return true;
      });
      setReagentNftsData(reagentNftsData);
    } catch (error) {
      console.log(error);
    }
  }, [nfts]);

  useEffect(() => {
    (async () => {
      await patchReagentNftsData();
    })();
  }, [nfts]);

  const callbackAfterReagentClick = (mintAccountAddress: string) => {
    const clickedReagentNftDataIndex = reagentNftsData.findIndex(
      reagentNftData => reagentNftData.mint === mintAccountAddress,
    );
    const clickedReagentNftData = reagentNftsData[clickedReagentNftDataIndex];
    setSelectedNftData(clickedReagentNftData);
  };

  const parentMint = selectedNftData ? new anchor.web3.PublicKey(selectedNftData.mint) : undefined;
  const parentMixtureProgramId = selectedNftData
    ? new anchor.web3.PublicKey(selectedNftData.data.creators[1].address)
    : undefined;

  const child2 = selectedNftData
    ? new anchor.web3.PublicKey(selectedNftData.properties.children[0].pubkeys[0])
    : undefined;
  const child1 = selectedNftData
    ? new anchor.web3.PublicKey(selectedNftData.properties.children[0].pubkeys[1])
    : undefined;
  const childMints = child1 && child2 ? [child1, child2] : [];

  console.log(parentMint, parentMixtureProgramId, child1, child2);

  const isPossible = useMemo(
    () => parentMint && parentMixtureProgramId && child1 && child2 && childMints,
    [parentMint, parentMixtureProgramId, child2, child1, childMints],
  );

  const callbackAfterDecompose = () => {
    alert('Complete!');
    window.location.reload();
  };
  console.log(selectedNftData);
  return (
    <>
      <div css={decomposeWrapStyle}>
        <TitleBox title="Separate Mixture" subTitle="You can get the reagents back before synthesizing" />
        {wallet?.publicKey && (
          <>
            <Inventory
              reagentNftsData={reagentNftsData}
              callbackAfterReagentClick={callbackAfterReagentClick}
              isLoading={isLoading}
              disabled={isLoading}
            />
            <section css={reagentCardsWrapStyle}>
              <ReagentCard data={selectedNftData} callbackAfterClick={callbackAfterReagentClick} disabled={isLoading} />
            </section>
            {isPossible && (
              <DecomposeMachine
                decomposeBtnCss={decomposeMachineBtnStyle}
                isLoading={isLoading}
                parentMint={parentMint!}
                parentMixtureProgramId={parentMixtureProgramId!}
                childMints={childMints}
                isDecomposing={isDecomposing}
                setIsDecomposing={setIsDecomposing}
                callbackAfterDecompose={callbackAfterDecompose}
              />
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Decompose;

const decomposeWrapStyle = css`
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

const decomposeMachineBtnStyle = (theme: Theme) => css`
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
