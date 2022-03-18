/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { ReagentNftData } from 'pages/Compose/Inventory';
import { getAttributeValue } from 'utils/metadata';
import { useMemo } from 'react';
import { saveToClipboard } from 'utils/clipboard';

interface ReagentCardProps {
  data?: ReagentNftData;
  callbackAfterClick?: (mint: string) => void;
  disabled?: boolean;
}

const ReagentCard = ({ data, callbackAfterClick, disabled }: ReagentCardProps) => {
  const isActive = Boolean(data);
  const handleReagentCardClick = () => {
    if (data && !disabled) {
      callbackAfterClick?.(data.mint);
    }
  };

  const handleClipboardBtnClick = (e: MouseEvent, txt: string) => {
    e.stopPropagation();
    saveToClipboard(txt);
  };

  const attributes = useMemo(() => {
    const element1 = data && getAttributeValue(data.attributes, 'Element1');
    const element2 = data && getAttributeValue(data.attributes, 'Element2');
    let result = [];
    if (element1) result.push(element1);
    if (element2) result.push(element2);
    return result;
  }, [data]);

  return (
    <article css={theme => reagentCardWrapStyle(theme, isActive)}>
      <div css={reagentCardStyle} onClick={handleReagentCardClick}>
        <div css={imageWrapStyle}>{data && <img alt="reagent" src={data.imageUrl} />}</div>
        <div css={descriptionWrapStyle}>
          <span css={theme => nameStyle(theme, isActive)}> {data ? data.data.name : 'Select Reagent'}</span>
          <div css={attributesWrapStyle}>
            {attributes.map(attribute => (
              <span key={attribute}>{attribute}</span>
            ))}
          </div>
          <span css={mintAddressStyle}>
            {data && (
              <>
                Mint : {data && data.mint.slice(0, 5) + '...' + data.mint.slice(-5)}
                <img src="/assets/icon/clipboard.png" onClick={e => handleClipboardBtnClick(e, data.mint)} />
              </>
            )}
          </span>
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
  height: calc(100% - 20px);
  padding: 20px 20px 0 20px;
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

const descriptionWrapStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  gap: 15px;
  height: 170px;
`;

const attributesWrapStyle = css`
  display: flex;
  justify-content: center;
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
  text-align: center;
  font-weight: bold;
  font-size: 24px;
  ${!isActive && `color: ${theme.color.dark}`};
`;

const mintAddressStyle = css`
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  justify-content: center;

  img {
    width: 20px;
    margin-left: 10px;
    margin-bottom: 5px;
    cursor: pointer;
  }
`;

export default ReagentCard;
