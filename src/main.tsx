import { App } from '@app/App';
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@app/i18n';
import '@styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container is missing in index.html');
}

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
