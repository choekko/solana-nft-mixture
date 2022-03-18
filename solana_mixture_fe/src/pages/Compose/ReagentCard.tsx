/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { ReagentNftData } from 'pages/Compose/Inventory';
import { getAttributeValue } from 'utils/metadata';

interface ReagentCardProps {
  data?: ReagentNftData;
  callbackAfterClick?: (mint: string) => void;
  disabled?: boolean;
}

const ReagentCard = ({ data, callbackAfterClick, disabled }: ReagentCardProps) => {
  const isActive = Boolean(data);
  const handleClick = () => {
    if (data && !disabled) {
      callbackAfterClick?.(data.mint);
    }
  };

  return (
    <article css={theme => reagentCardWrapStyle(theme, isActive)}>
      <div css={reagentCardStyle} onClick={handleClick}>
        <div css={imageWrapStyle}>{data && <img alt="reagent" src={data.imageUrl} />}</div>
        <span css={theme => nameStyle(theme, isActive)}> {data ? data.data.name : 'Select Reagent'}</span>
        <div css={attributesWrapStyle}>
          {data && <span>{getAttributeValue(data.attributes, 'Element1')}</span>}
          {data && getAttributeValue(data.attributes, 'Element2') && (
            <span>{getAttributeValue(data.attributes, 'Element2')}</span>
          )}
        </div>
      </div>
    </article>
  );
};

const reagentCardWrapStyle = (theme: Theme, isActive: boolean) => css`
  width: 250px;
  height: 400px;
  border: 1px solid ${isActive ? theme.color.skyblue : theme.color.dark};
  background-color: ${theme.color.backgroundDark};
  border-radius: 0 0 7px 7px;

  &::before {
    content: '';
    flex: none;
    width: 100%;
    height: 20px;
    display: block;
    background-color: ${theme.color.dark};
  }
`;
const reagentCardStyle = css`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: space-around;
  height: calc(100% - 20px);
  padding: 20px;
  box-sizing: border-box;
`;

const imageWrapStyle = (theme: Theme) => css`
  width: 210px;
  height: 190px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${theme.color.backgroundDeepDark};

  img {
    width: 190px;
    height: 190px;
  }
`;

const attributesWrapStyle = css`
  display: flex;
  justify-content: space-between;
  gap: 20px;

  & > span {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 90px;
    height: 30px;
    border: 1px solid #525252;
    color: #ffffff;
  }
`;

const nameStyle = (theme: Theme, isActive: boolean) => css`
  font-weight: bold;
  font-size: 24px;
  ${!isActive && `color: ${theme.color.dark}`};
`;

export default ReagentCard;
