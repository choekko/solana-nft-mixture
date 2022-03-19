/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { saveToClipboard } from 'utils/clipboard';

interface ProfileProps {
  imgUrl: string;
  name: string;
  email?: string;
}

const Profile = ({ imgUrl, name, email }: ProfileProps) => {
  const handleClipboardBtnClick = (e: MouseEvent, txt: string) => {
    e.stopPropagation();
    saveToClipboard(txt, 'Email has been copied.');
  };

  return (
    <>
      <table css={profileStyle}>
        <colgroup>
          <col style={{ width: '20%' }} />
          <col style={{ width: '30%' }} />
          <col style={{ width: '40%' }} />
          <col />
        </colgroup>
        <tbody>
          <tr>
            <td>
              {' '}
              <img css={profileImgStyle} src={imgUrl} />{' '}
            </td>
            <td>
              {' '}
              <span>{name}</span>{' '}
            </td>
            <td>
              {' '}
              <span>{email}</span>{' '}
            </td>
            <td>
              <img
                css={clipboardImgStyle}
                src="/assets/icon/clipboard.png"
                onClick={e => handleClipboardBtnClick(e, email)}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

const profileStyle = (theme: Theme) => css`
  width: inherit;
  min-width: 600px;
  min-height: 100px;
  border: 1px solid ${theme.color.dark};
  border-left: 5px solid ${theme.color.skyblue};
  border-collapse: separate;
  border-radius: 0 30px 30px 0;

  td {
    vertical-align: middle;

    &:nth-child(1) {
      text-align: end;
      font-size: 20px;
    }
    &:nth-child(2) {
      text-align: center;
      span {
        font-size: 23px;
        font-weight: bold;
      }
    }
  }
`;

const profileImgStyle = css`
  width: 70px;
  height: 70px;
  border-radius: 100%;
`;

const clipboardImgStyle = css`
  width: 20px;
  cursor: pointer;
`;

export default Profile;
