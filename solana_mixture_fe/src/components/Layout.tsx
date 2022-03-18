/** @jsxImportSource @emotion/react */

import Lnb from './Lnb';
import { css, Theme } from '@emotion/react';
import React from 'react';
import WalletBtn from './WalletBtn';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div>
      <Lnb />
      <div css={mainSectionWrapCss}>
        <section>{children}</section>
      </div>
      <div css={WalletBtnWrapCss}>
        <WalletBtn />
      </div>
    </div>
  );
};

const mainSectionWrapCss = (theme: Theme) => css`
  padding-left: 100px;
  background-color: ${theme.color.backgroundDeepDark};
  height: 100vh;
  display: flex;
  justify-content: center;

  & > section {
    width: 1024px;
    display: flex;
    align-items: center;
  }
`;

const WalletBtnWrapCss = css`
  position: fixed;
  right: 25px;
  top: 25px;
`;

export default Layout;
