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

    // Timeline data - applications over time (last 6 months)
    const timelineData = useMemo(() => {
        const months = {};
        const now = new Date();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            months[key] = { month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), count: 0 };
        }

        // Count applications by month
        applications.forEach(app => {
            const date = app.date ? new Date(app.date) : (app.createdAt?.seconds ? new Date(app.createdAt.seconds * 1000) : null);
            if (date) {
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (months[key]) {
                    months[key].count++;
                }
            }
        });

        return Object.values(months);
    }, [applications]);

    // Average time in each status
    const avgTimeInStatus = useMemo(() => {
        const statusTimes = {
            Draft: [],
            Applied: [],
            Interview: [],
            Offer: [],
            Rejected: []
        };

        applications.forEach(app => {
            if (app.history && app.history.length > 1) {
                for (let i = 0; i < app.history.length - 1; i++) {
                    const current = app.history[i];
                    const next = app.history[i + 1];
                    const currentDate = new Date(current.date);
                    const nextDate = new Date(next.date);
                    const days = Math.floor((nextDate - currentDate) / (1000 * 60 * 60 * 24));

                    if (statusTimes[current.status]) {
                        statusTimes[current.status].push(days);
                    }
                }

                // Add time for current status
                const lastHistory = app.history[app.history.length - 1];
                const lastDate = new Date(lastHistory.date);
                const now = new Date();
                const days = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
                if (statusTimes[lastHistory.status]) {
                    statusTimes[lastHistory.status].push(days);
                }
            }
        });

        // Calculate averages
        const averages = {};
        Object.entries(statusTimes).forEach(([status, times]) => {
            if (times.length > 0) {
                const avg = times.reduce((sum, t) => sum + t, 0) / times.length;
                averages[status] = Math.round(avg);
            } else {
                averages[status] = 0;
            }
        });

        return averages;
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

            {/* Timeline Chart */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Application Activity (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="month" stroke="#888" />
                        <YAxis stroke="#888" />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Average Time in Status */}
            <div className="card" style={{ padding: 'var(--space-5)' }}>
                <h3 className="text-lg" style={{ marginBottom: 'var(--space-4)' }}>Average Time in Each Status</h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: 'var(--space-3)'
                }}>
                    {Object.entries(avgTimeInStatus).map(([status, days]) => (
                        <div
                            key={status}
                            style={{
                                padding: 'var(--space-3)',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                borderRadius: 'var(--radius-md)',
                                border: `1px solid ${getStatusColor(status)}40`,
                                textAlign: 'center'
                            }}
                        >
                            <div style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                marginBottom: 'var(--space-1)'
                            }}>
                                {status}
                            </div>
                            <div style={{
                                fontSize: '28px',
                                fontWeight: 'bold',
                                color: getStatusColor(status)
                            }}>
                                {days}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: 'var(--text-secondary)',
                                marginTop: 'var(--space-1)'
                            }}>
                                days avg
                            </div>
                        </div>
                    ))}
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
