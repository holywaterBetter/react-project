import { App } from '@app/App';
import { initializeThemeMode } from '@theme';
import React from 'react';
import { createRoot } from 'react-dom/client';

import '@app/i18n';
import '@styles/global.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container is missing in index.html');
}

initializeThemeMode();

createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
