import React from 'react';
import { useHistory } from 'react-router-dom';
import './landingPage.css';

const LandingPage = () => {
  const history = useHistory();

  const handleClick = () => {
    history.push('/home');
  };

  return (
    <div className="landing-container">
      <h1>Welcome to Dog App</h1>
      <button onClick={handleClick}>Enter</button>
    </div>
  );
};

export default LandingPage;
