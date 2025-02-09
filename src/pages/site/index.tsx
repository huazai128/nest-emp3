import React from 'react';
import ReactDOM from 'react-dom/client';
import Test from './componets/Test';

const root = ReactDOM.createRoot(document.getElementById('emp-root')!);

root.render(
  <React.StrictMode>
    <Test />
    <div>123阿是</div>
  </React.StrictMode>,
);
