/** @jsxImportSource @emotion/react */

import TitleBox from 'components/TitleBox';
import Profile from 'pages/Contact/Profile';
import { css } from '@emotion/react';

const Contact = () => {
  const profiles = [
    { imgUrl: '/assets/profile_woo.png', name: 'woo', email: 'poppinjaewoo@gmail.com' },
    { imgUrl: '/assets/profile_seung.png', name: 'seung', email: 'skyhs3507@likelion.org' },
    { imgUrl: '/assets/profile_hoo.png', name: 'hoo', email: 'choekko@gmail.com' },
  ];

  return (
    <>
      <main css={contactWrapStyle}>
        <TitleBox title="Contact" subTitle="If you have any questions, please email us" />
        <section css={profileWrapStyle}>
          {profiles.map(({ imgUrl, name, email }) => (
            <Profile imgUrl={imgUrl} name={name} email={email} />
          ))}
        </section>
      </main>
    </>
  );
};

const contactWrapStyle = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 40px;
`;

const profileWrapStyle = css`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export default Contact;
