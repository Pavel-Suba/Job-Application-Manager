import React, { useMemo } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
    const { docs: applications } = useFirestore('applications');
    const { docs: cvs } = useFirestore('cvs');

    const stats = useMemo(() => {
        const statusCounts = {
            Draft: 0,
            Applied: 0,
            Interview: 0,
            Offer: 0,
            Rejected: 0
        };

        applications.forEach(app => {
            if (statusCounts.hasOwnProperty(app.status)) {
                statusCounts[app.status]++;
            }
        });

        const total = applications.length;
        const successRate = total > 0 ? ((statusCounts.Interview + statusCounts.Offer) / total * 100).toFixed(1) : 0;

        return {
            total,
            statusCounts,
            successRate,
            cvCount: cvs.length
        };
    }, [applications, cvs]);

    const chartData = [
        { name: 'Draft', value: stats.statusCounts.Draft, color: '#6b7280' },
        { name: 'Applied', value: stats.statusCounts.Applied, color: '#8b5cf6' },
        { name: 'Interview', value: stats.statusCounts.Interview, color: '#3b82f6' },
        { name: 'Offer', value: stats.statusCounts.Offer, color: '#10b981' },
        { name: 'Rejected', value: stats.statusCounts.Rejected, color: '#ef4444' }
    ];

    const barData = Object.entries(stats.statusCounts).map(([name, value]) => ({
        name,
        count: value
    }));

    const getStatusColor = (status) => {
        const colors = {
            Draft: '#6b7280',
            Applied: '#8b5cf6',
            Interview: '#3b82f6',
            Offer: '#10b981',
            Rejected: '#ef4444'
        };
        return colors[status] || '#6b7280';
    };

    const recentApplications = useMemo(() => {
        return [...applications]
            .sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            })
            .slice(0, 5);
    }, [applications]);

    return (
        <div className="flex-col gap-6">
            <h2 className="text-2xl">Dashboard</h2>

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Total Applications
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {stats.total}
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Success Rate
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981' }}>
                        {stats.successRate}%
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                        Interview + Offer / Total
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        Active Interviews
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {stats.statusCounts.Interview}
                    </div>
                </div>

                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                        CVs Uploaded
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#8b5cf6' }}>
                        {stats.cvCount}
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: 'var(--space-4)'
            }}>
                {/* Bar Chart */}
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Applications by Status</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis dataKey="name" stroke="#888" />
                            <YAxis stroke="#888" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                                labelStyle={{ color: '#fff' }}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Pie Chart */}
                <div className="card" style={{ padding: 'var(--space-5)' }}>
                    <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => percent > 0 ? `${name} ${(percent * 100).toFixed(0)}%` : ''}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Applications */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Recent Applications</h3>
                {recentApplications.length === 0 ? (
                    <p className="text-secondary">No applications yet. Start by adding one!</p>
                ) : (
                    <div className="flex-col gap-3">
                        {recentApplications.map(app => (
                            <div
                                key={app.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-3)',
                                    backgroundColor: 'rgba(255,255,255,0.02)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--border)'
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 500 }}>{app.company}</div>
                                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        {app.position}
                                    </div>
                                </div>
                                <div
                                    className="badge"
                                    style={{
                                        backgroundColor: getStatusColor(app.status) + '20',
                                        color: getStatusColor(app.status),
                                        border: `1px solid ${getStatusColor(app.status)}`
                                    }}
                                >
                                    {app.status}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Quick Actions */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Quick Actions</h3>
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                    <a href="/applications" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                        + New Application
                    </a>
                    <a href="/cvs" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                        📄 Upload CV
                    </a>
                    <a href="/ai-assistant" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                        ✨ AI Assistant
                    </a>
                </div>
            </div>
        </div>
    );
};

export { Profile } from './Profile';
export { CVManager } from './CVManager';
export { Applications } from './Applications';
