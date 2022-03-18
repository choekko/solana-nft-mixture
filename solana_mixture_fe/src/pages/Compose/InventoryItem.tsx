/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';

interface InventoryItemProps {
  imageUrl: string;
  name: string;
  mintAccountAddress: string;
  isClicked?: boolean;
  callbackAfterClick?: (mintAccountAddress: string) => void;
}

const InventoryItem = ({
  imageUrl,
  name,
  mintAccountAddress,
  isClicked = false,
  callbackAfterClick,
}: InventoryItemProps) => {
  const handleClick = () => {
    callbackAfterClick?.(mintAccountAddress);
  };

  return (
    <>
      <div css={theme => InventoryItemStyle(theme, isClicked)} onClick={handleClick}>
        <img alt="reagent" src={imageUrl} />
        <span>{name}</span>
      </div>
    </>
  );
};

const InventoryItemStyle = (theme: Theme, isClicked: boolean) => css`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 100px;
  box-sizing: border-box;
  ${isClicked &&
  `
    border: 1px solid ${theme.color.skyblue}; 
    border-radius: 10px; 
  `}

  img {
    width: 70px;
    height: 70px;
  }
  span {
    font-size: 12px;
  }
`;

export default InventoryItem;
