import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with automatic updates
registerSW({
  onOfflineReady() {
    console.log('App ready for offline use');
  },
  onNeedRefresh() {
    // With autoUpdate: true in vite.config.ts, this might not be strictly necessary 
    // for simple logic, but good for explicit handling.
    if (confirm('New version available. Update now?')) {
      window.location.reload();
    }
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
