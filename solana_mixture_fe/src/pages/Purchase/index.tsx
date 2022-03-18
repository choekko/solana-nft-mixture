/** @jsxImportSource @emotion/react */
import TitleBox from '../../components/TitleBox';
import MintBox from './MintBox';
import { css } from '@emotion/react';

const Purchase = () => {
  return (
    <div>
      <TitleBox title="Buy Reagent" subTitle="Buy, Mix, and Research!" />
      <div css={mintBoxWrapCss}>
        <MintBox />
      </div>
    </div>
  );
};

const mintBoxWrapCss = css`
  margin: 80px 0;
  width: 100%;
  display: flex;
  justify-content: center;
`;

export default Purchase;
