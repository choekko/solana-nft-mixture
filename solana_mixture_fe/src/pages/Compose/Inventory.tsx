/** @jsxImportSource @emotion/react */

import { css, Theme } from '@emotion/react';
import { NftTokenAccount } from '@nfteyez/sol-rayz-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import InventoryItem from 'pages/Compose/InventoryItem';

export interface ReagentNftData extends NftTokenAccount {
  imageUrl: string;
  attributes: any[];
  properties?: any;
  isClicked?: boolean;
}

interface InventoryProps {
  reagentNftsData: ReagentNftData[];
  callbackAfterReagentClick?: (mintAccountAddress: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

const Inventory = ({ reagentNftsData, callbackAfterReagentClick, isLoading, disabled }: InventoryProps) => {
  const callbackAfterItemClick = (mintAddress: string) => {
    if (disabled) return;
    callbackAfterReagentClick?.(mintAddress);
  };

  return (
    <>
      <div>
        <span css={inventoryDecorationTextStyle}>inventory </span>
        {isLoading ? (
          <div css={inventoryStyle}>
            <span>loading...</span>
          </div>
        ) : reagentNftsData.length === 0 ? (
          <div css={inventoryStyle}>
            <span>
              No current version of the item was found (devnet).
              <br /> Check if your wallet is loading.
            </span>
          </div>
        ) : reagentNftsData.length <= 7 ? (
          <div css={inventoryStyle}>
            {reagentNftsData.map(reagentNftData => (
              <InventoryItem
                key={reagentNftData.mint}
                imageUrl={reagentNftData.imageUrl}
                name={reagentNftData.data.name}
                mintAccountAddress={reagentNftData.mint}
                isClicked={reagentNftData.isClicked}
                callbackAfterClick={callbackAfterItemClick}
              />
            ))}
          </div>
        ) : (
          <Swiper css={inventoryStyle} spaceBetween={0} slidesPerView={7}>
            {reagentNftsData.map(reagentNftData => (
              <SwiperSlide>
                <InventoryItem
                  key={reagentNftData.mint}
                  imageUrl={reagentNftData.imageUrl}
                  name={reagentNftData.data.name}
                  mintAccountAddress={reagentNftData.mint}
                  isClicked={reagentNftData.isClicked}
                  callbackAfterClick={callbackAfterItemClick}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
        <span css={inventoryDecorationTextStyle}>
          version:<span>{process.env.REACT_APP_VERSION}</span>
        </span>
      </div>
    </>
  );
};

const inventoryStyle = css`
  display: flex;
  margin: 2px 0;
  justify-content: center;
  align-items: center;
  width: 560px;
  height: 100px;
  border: 1px solid #737373;
  font-size: 20px;
`;

const inventoryDecorationTextStyle = (theme: Theme) => css`
  display: flex;
  justify-content: end;

  & > span {
    color: ${theme.color.skyblue};
    margin-left: 3px;
  }
`;

export default Inventory;
