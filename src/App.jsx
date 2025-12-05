import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { Dashboard, Applications, CVManager, Profile } from './pages';
import { AIAssistant } from './pages/AIAssistant';
import { CoverLetters } from './pages/CoverLetters';
import { MasterProfiles } from './pages/MasterProfiles';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';

function App() {
  return (
    <ThemeProvider>
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
            <Route path="/cover-letters" element={
              <ProtectedRoute>
                <Layout>
                  <CoverLetters />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/master-profiles" element={
              <ProtectedRoute>
                <Layout>
                  <MasterProfiles />
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
    </ThemeProvider>
  );
}

export default App;
