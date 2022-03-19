/** @jsxImportSource @emotion/react */

import { css, Theme } from '@emotion/react';
import LnbTab from './LnbTab';

const Lnb = () => {
  const tabs = ['home', 'purchase', 'compose', 'decompose', 'contact'] as const;

  return (
    <nav css={lnbCss}>
      <div css={{ flex: 'none' }}>
        <div css={logoCss}>
          <img src="/assets/icon/logo.png" alt="logo" />
        </div>
        {tabs.map(tab => tab !== 'contact' && <LnbTab key={tab} tabName={tab} />)}
      </div>
      <div css={{ marginBottom: '20px' }}>
        <LnbTab tabName="contact" />
      </div>
    </nav>
  );
};

const lnbCss = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: fixed;
  width: 100px;
  height: 100%;
  background-color: ${theme.color.dark};
  z-index: 99;
`;

const logoCss = css`
  width: 100px;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;

  img {
    width: 66px;
    height: 66px;
  }
`;

export default Lnb;
