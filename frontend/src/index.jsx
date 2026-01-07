import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/App.css';
import App from './App';

// Hide loading screen when React mounts
const hideLoadingScreen = () => {
  const loading = document.getElementById('loading');
  if (loading) {
    loading.style.opacity = '0';
    setTimeout(() => {
      loading.style.display = 'none';
    }, 500);
  }
};

// تأكد من أن هذا العنصر موجود في الـ HTML
const rootElement = document.getElementById('root');

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Hide loading screen after React mounts
  setTimeout(hideLoadingScreen, 100);
} else {
  console.error('Failed to find the root element');
  // إنشاء العنصر يدوياً إذا لم يكن موجوداً
  const rootDiv = document.createElement('div');
  rootDiv.id = 'root';
  document.body.appendChild(rootDiv);
  
  const root = ReactDOM.createRoot(rootDiv);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  // Hide loading screen after React mounts
  setTimeout(hideLoadingScreen, 100);
}