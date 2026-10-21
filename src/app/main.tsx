import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { trackInputModality } from './input-modality';

const root = document.getElementById('root');
if (root === null) {
  throw new Error('root element is missing');
}

trackInputModality(document);

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
