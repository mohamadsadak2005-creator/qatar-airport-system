import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataEntry from './components/DataEntry';
import AIAssistant from './components/AIAssistant';
import Charts from './components/Charts';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { HealthDataProvider } from './contexts/HealthDataContext';
import { LanguageProvider } from './contexts/LanguageContext';

// Styles
import './styles/App.css';

// Main App Component
function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HealthDataProvider>
          <Router>
            <div className="app">
              <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={true}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
              />
              <Routes>
                <Route path="/login" element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                } />
                <Route path="/*" element={
                  <PrivateRoute>
                    <AppContent />
                  </PrivateRoute>
                } />
              </Routes>
            </div>
          </Router>
        </HealthDataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

// Main content for authenticated users
const AppContent = () => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/data-entry" element={<DataEntry />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/charts" element={<Charts />} />
        </Routes>
      </main>
      <SimpleFooter />
    </div>
  );
};

// Simple Footer without translation hook
const SimpleFooter = () => {
  return (
    <footer>
      <p>© 2024 Smart Health System. All rights reserved. | Disclaimer: This system is not a substitute for professional medical consultation.</p>
    </footer>
  );
};

export default App;