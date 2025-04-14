import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Create a public directory for static assets if needed
// This is just to ensure placeholder images are available for development
// In production, these would be served from a proper backend or CDN
const createPlaceholders = () => {
  // This is just a comment for development purposes
  // In a real app, you'd ensure all static assets are available
  console.log('Ensuring static assets for development...');
};

createPlaceholders();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();