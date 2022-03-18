/** @jsxImportSource @emotion/react */

import { css } from '@emotion/react';
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
        <span style={{ right: 0 }}>inventory </span>
        {isLoading ? (
          <div css={inventoryStyle}>
            <span>isLoading...</span>
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
      </div>
    </>
  );
};

const inventoryStyle = css`
  margin: 0 0 20px;
  display: flex;
  justify-content: center;
  width: 560px;
  height: 100px;
  border: 1px solid #737373;
`;

export default Inventory;
