import React from 'react';

export { Profile } from './Profile';
export { CVManager } from './CVManager';

export const Dashboard = () => (
    <div>
        <h2 className="text-2xl" style={{ marginBottom: 'var(--space-6)' }}>Dashboard</h2>
        <div className="card">
            <p className="text-secondary">Welcome to your Job Search Command Center.</p>
            <div style={{ marginTop: 'var(--space-4)' }}>
                <p>Use the sidebar to navigate:</p>
                <ul style={{ listStyle: 'disc', marginLeft: 'var(--space-6)', marginTop: 'var(--space-2)', color: 'var(--text-secondary)' }}>
                    <li><strong>Applications:</strong> Track your job applications.</li>
                    <li><strong>CV Manager:</strong> Manage your CV versions.</li>
                    <li><strong>Master Profile:</strong> Store your source data for AI.</li>
                </ul>
            </div>
        </div>
    </div>
);

export { Applications } from './Applications';

