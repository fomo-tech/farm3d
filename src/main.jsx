import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

window.__farmDebug?.mark('React entry executing');

createRoot(document.getElementById('root')).render(
  <App />,
);

window.__farmDebug?.mark('React mounted');
