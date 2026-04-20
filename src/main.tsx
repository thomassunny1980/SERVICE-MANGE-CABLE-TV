import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Debugging helper
window.onerror = function(message, source, lineno, colno, error) {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="padding: 20px; color: red; background: #fff;">
      <h2>Runtime Error:</h2>
      <p>${message}</p>
      <pre>${error?.stack || ''}</pre>
    </div>`;
  }
};

console.log('Mounting App...');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
