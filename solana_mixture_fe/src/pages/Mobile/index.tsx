/** @jsxImportSource @emotion/react */

import React from 'react';
import { css, Theme } from '@emotion/react';

const Mobile = () => {
  return (
    <>
      <section css={mobilePageStyle}>
        <img src="/assets/icon/logo.png" />
        <p> Please connect via PC </p>
      </section>
    </>
  );
};

const mobilePageStyle = (theme: Theme) => css`
  background-color: ${theme.color.backgroundDeepDark};
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 40px;

  p {
    font-size: 30px;
    color: white;
    font-weight: bold;
  }
`;

export default Mobile;
