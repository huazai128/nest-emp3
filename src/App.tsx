import './App.css';
import React, { useEffect } from 'react';
import { getWxConfig } from './utils/wxConfig';
const App = () => {
  useEffect(() => {
    getWxConfig();
  }, []);

  return (
    <div className="content">
      <h1>EMP with React</h1>
      <p>Start building wonderful things with EMP</p>
    </div>
  );
};

export default App;
