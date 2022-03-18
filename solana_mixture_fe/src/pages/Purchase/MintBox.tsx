/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import MintMachine from 'components/core/MintMachine';

const MintBox = () => {
  return (
    <div css={MintBoxCss}>
      <img src="/assets/potion_gif.gif" />
      <span> Random Reagent X 1</span>
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

  & > span {
    color: white;
    font-size: 24px;
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
