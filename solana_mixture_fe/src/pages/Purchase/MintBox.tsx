/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import MintMachine from 'components/core/MintMachine';

const MintBox = () => {
  return (
    <div css={MintBoxCss}>
      <img src="/assets/potion_gif.gif" />
      <div>
        <span css={itemTextStyle}> Random Reagent X 1</span>
        <p css={versionTextStyle}>
          (version: <span>{process.env.REACT_APP_VERSION}</span>)
        </p>
      </div>
      <div css={MintMachineStyle}>
        <MintMachine />
      </div>
    </div>
  );
};

const MintBoxCss = (theme: Theme) => css`
  width: 300px;
  height: 350px;
  border: 1px solid ${theme.color.skyblue};
  border-radius: 10px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 30px;

  & > img {
    width: 163px;
    height: 163px;
  }
`;

const itemTextStyle = css`
  font-size: 24px;
`;

const versionTextStyle = (theme: Theme) => css`
  color: white;
  font-size: 17px;
  text-align: center;
  margin-top: 10px;

  & > span {
    color: ${theme.color.skyblue};
  }
`;

const MintMachineStyle = (theme: Theme) => css`
  button {
    width: 200px;
    height: 50px;
    border-radius: 20px;
    background-color: ${theme.color.skyblue};
    color: ${theme.color.dark};
    font-size: 22px;
    font-weight: bold;

    &:disabled {
      background-color: #777777;
      cursor: default;
    }

    &:hover:not(:disabled) {
      background-color: white;
    }
  }
`;

export default MintBox;
