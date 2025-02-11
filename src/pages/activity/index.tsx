import Page from '@src/components/Page';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createStore } from '@src/components/PageProvider';
import globalStore from '@src/stores/GlobalStore';

const { useStore, StoreProvider } = createStore(globalStore);

const root = ReactDOM.createRoot(document.getElementById('emp-root')!);
root.render(
  <React.StrictMode>
    <StoreProvider>
      <Page title="活动">
        <div>123阿城阿是</div>
      </Page>
    </StoreProvider>
  </React.StrictMode>,
);
