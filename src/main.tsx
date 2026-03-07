import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent page reload on visibility change
document.addEventListener('visibilitychange', (event) => {
  event.preventDefault();
  return false;
}, false);

createRoot(document.getElementById('root')!).render(
  <App />
);