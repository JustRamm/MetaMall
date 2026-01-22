import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen.tsx';
import { AuthPage } from './components/ui/auth-page';
import HomePage from './components/HomePage.tsx';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSplashComplete = () => {
    setLoading(false);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (loading) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/auth"
            element={
              isAuthenticated ? <Navigate to="/home" /> : <AuthPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/home"
            element={
              isAuthenticated ? <HomePage onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/auth" />
            }
          />
          <Route
            path="/"
            element={<Navigate to={isAuthenticated ? "/home" : "/auth"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
