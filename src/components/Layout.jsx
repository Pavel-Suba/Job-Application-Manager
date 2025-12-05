import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/applications', label: 'Applications', icon: '💼' },
    { path: '/cvs', label: 'CV Manager', icon: '📄' },
    { path: '/cover-letters', label: 'Cover Letters', icon: '📝' },
    { path: '/master-profiles', label: 'Master Profiles', icon: '👤' },
    { path: '/ai-assistant', label: 'AI Assistant', icon: '✨' },
    { path: '/profile', label: 'Raw Data', icon: '📋' },
  ];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: isSidebarOpen ? '260px' : '0px',
          borderRight: '1px solid var(--border)',
          padding: isSidebarOpen ? 'var(--space-6)' : '0',
          opacity: isSidebarOpen ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          whiteSpace: 'nowrap'
        }}
        className="flex-col"
      >
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-8)' }}>
          <div className="flex items-center gap-2">
            <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '8px', flexShrink: 0 }}></div>
            <h1 className="text-xl">JobManager</h1>
          </div>
          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>

        <nav className="flex-col gap-2" style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 ${location.pathname === item.path ? 'text-primary' : 'text-secondary'}`}
              style={{
                padding: 'var(--space-2) var(--space-3)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: location.pathname === item.path ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {currentUser && (
          <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-4)' }}>
            <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
              {currentUser.photoURL ? (
                <img src={currentUser.photoURL} alt="Profile" style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
              ) : (
                <div style={{ width: '32px', height: '32px', backgroundColor: '#ddd', borderRadius: '50%' }}></div>
              )}
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.displayName}</p>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{currentUser.email}</p>
              </div>
            </div>
            <button
              onClick={logout}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#fee2e2',
                color: '#ef4444',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto', position: 'relative' }}>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            left: 'var(--space-4)',
            background: 'transparent',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            zIndex: 10,
            color: 'var(--text-secondary)'
          }}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>
        <div className="container" style={{ marginTop: 'var(--space-6)' }}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
