import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import RouterComp from '@src/components/RouterComp';

const root = ReactDOM.createRoot(document.getElementById('emp-root')!);
const routes = [
  {
    path: '/home',
    element: lazy(() => import('./pages/Home')),
  },
  {
    path: '/user',
    element: lazy(() => import('./pages/User')),
  },
];

root.render(
  <React.StrictMode>
    <RouterComp routes={routes} />
  </React.StrictMode>,
);
