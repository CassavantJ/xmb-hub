import '@fontsource-variable/inter';
import './styles/global.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { NotFoundPage } from './NotFoundPage';

const container = document.getElementById('root');
if (!container) throw new Error('404.html is missing #root');

createRoot(container).render(
  <StrictMode>
    <NotFoundPage />
  </StrictMode>,
);
