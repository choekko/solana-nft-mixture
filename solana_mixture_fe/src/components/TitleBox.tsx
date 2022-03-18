/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

interface TitleBoxProps {
  title: string;
  subTitle?: string;
}

const TitleBox = ({ title, subTitle }: TitleBoxProps) => {
  return (
    <div css={titleBoxCss}>
      <h1 css={{ fontWeight: 'bold', fontSize: '43px' }}>{title}</h1>
      <div css={dividerCss} />
      {subTitle && <h2 css={{ fontSize: '24px', marginTop: '5px' }}>{subTitle}</h2>}
    </div>
  );
};

const titleBoxCss = css`
  width: 1024px;
  text-align: start;
  color: white;
`;

const dividerCss = css`
  border-bottom: 1px solid #737373;
  height: 1px;
  width: 100%;
`;

export default TitleBox;
