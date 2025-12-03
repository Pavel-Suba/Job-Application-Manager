import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/applications', label: 'Applications', icon: '💼' },
    { path: '/cvs', label: 'CV Manager', icon: '📄' },
    { path: '/ai-assistant', label: 'AI Assistant', icon: '✨' },
    { path: '/profile', label: 'Master Profile', icon: '👤' },
  ];

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '260px', borderRight: '1px solid var(--border)', padding: 'var(--space-6)' }} className="flex-col">
        <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, var(--primary), var(--accent))', borderRadius: '8px' }}></div>
          <h1 className="text-xl">JobManager</h1>
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
      <main style={{ flex: 1, padding: 'var(--space-8)', overflowY: 'auto' }}>
        <div className="container">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
