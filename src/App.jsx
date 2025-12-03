import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard, Applications, CVManager, Profile } from './pages';
import { AIAssistant } from './pages/AIAssistant';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/applications" element={
            <ProtectedRoute>
              <Layout>
                <Applications />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/cvs" element={
            <ProtectedRoute>
              <Layout>
                <CVManager />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/ai-assistant" element={
            <ProtectedRoute>
              <Layout>
                <AIAssistant />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
