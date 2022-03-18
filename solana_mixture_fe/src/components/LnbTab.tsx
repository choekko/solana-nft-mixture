/** @jsxImportSource @emotion/react */
import { css, Theme } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface LnbTabProps {
  tabName: 'home' | 'purchase' | 'compose' | 'decompose' | 'compare';
}

const LnbTab = ({ tabName }: LnbTabProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isActive, setIsActive] = useState(false);

  const currentFirstPath = location.pathname.split('/')[1];
  const currentTab = currentFirstPath === '' ? 'home' : currentFirstPath;
  const isCurrentTab = tabName === currentTab;

  useEffect(() => {
    setIsActive(isCurrentTab);
  }, [isCurrentTab]);

  const iconColorType = isActive ? 'skyblue' : 'dark';

  const handleMouseEnter = () => {
    setIsActive(true);
  };

  const handleMouseLeave = () => {
    if (!isCurrentTab) {
      setIsActive(false);
    }
  };

  const handleClick = () => {
    if (tabName === 'home') {
      navigate('/');
      return;
    }
    navigate(`/${tabName}`);
  };

  return (
    <>
      <button
        css={theme => LabTabStyle(theme, tabName, isActive)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <img src={`/assets/icon/${tabName}_${iconColorType}.png`} alt={tabName} />
        {tabName !== 'compare' && <span>{tabName}</span>}
      </button>
    </>
  );
};

const LabTabStyle = (theme: Theme, tabName: string, isActive: boolean) => css`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  width: ${tabName === 'compare' ? '70px' : '100px'};
  height: ${tabName === 'compare' ? '70px' : '100px'};
  background-color: ${isActive ? 'white' : theme.color.skyblue};
  border: 0.5px solid ${theme.color.dark};

  ${tabName === 'compare' &&
  css`
    border-radius: 20px;
  `}

  img {
    width: 50px;
    height: 50px;
    ${tabName === 'decompose' ? 'margin-bottom: 5px' : null};
  }

  span {
    color: ${isActive ? theme.color.skyblue : theme.color.dark};
    font-weight: bold;
  }
`;

export default LnbTab;
