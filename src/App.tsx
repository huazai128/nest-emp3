import React, { useEffect } from 'react';
import { getWxConfig } from './utils/wxConfig';
import './App.css';

const App = () => {
  useEffect(() => {
    getWxConfig();
  }, []);

  return (
    <div className="content flex-center">
      <h1>{window.INIT_DATA?.userInfo?.name}</h1>
      <p>Start building wonderful things with EMP</p>
    </div>
  );
};

export default App;
