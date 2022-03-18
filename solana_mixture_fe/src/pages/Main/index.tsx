/** @jsxImportSource @emotion/react */

import React from 'react';
import TitleBox from 'components/TitleBox';
import { css, Theme } from '@emotion/react';
import { Link } from 'react-router-dom';

const Main = () => {
  return (
    <div css={mainStyle}>
      <TitleBox title="Home" />
      <section css={bannerStyle}>
        <div css={descriptionStyle}>
          <span>
            Welcome to
            <br /> our Laboratory
          </span>
          <img css={mixImageStyle} src="/assets/mix_process.png" />
          <div css={btnWrapStyle}>
            <Link to="/purchase">
              <img src="/assets/icon/purchase_outline.png" />
              Purchase
            </Link>
            <Link to="/compose">
              <img src="/assets/icon/compose_outline.png" />
              Compose
            </Link>
          </div>
        </div>
        <img css={bannerImageStyle} src="/assets/banner.png" />
      </section>
    </div>
  );
};

const mainStyle = css`
  dispaly: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const bannerStyle = (theme: Theme) => css`
  border: 1px solid ${theme.color.skyblue};
  margin-top: 20px;
  border-radius: 24px;
  display: flex;
  justify-content: space-between;
  overflow: hidden;
  padding: 30px 50px;
`;
const descriptionStyle = css`
  flex: 0 1 400px;
  display: flex;
  justify-content: center;
  align-items: start;
  flex-direction: column;
  gap: 30px 0;

  & > span {
    font-size: 40px;
    font-weight: bold;
  }

  & > img {
    transform: translate(-20px, 0);
  }
`;

const bannerImageStyle = css`
  flex: 0 0 500px;
  height: 400px;
`;

const mixImageStyle = css`
  width: 300px;
`;

const btnWrapStyle = (theme: Theme) => css`
  display: flex;
  gap: 20px;

  a {
    width: 150px;
    height: 40px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
    background-color: ${theme.color.skyblue};
    color: ${theme.color.dark};
    text-decoration: none;
    font-size: 20px;
    font-weight: bold;

    img {
      margin-bottom: 3px;
    }
  }

  img {
    margin-right: 4px;
    width: 23px;
  }
`;

export default Main;
