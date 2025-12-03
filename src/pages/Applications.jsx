import React, { useState, useMemo } from 'react';
import { useFirestore } from '../hooks/useFirestore';

export const Applications = () => {
    const { docs: applications, addDocument, updateDocument, deleteDocument, loading, error } = useFirestore('applications');
    const [showAdd, setShowAdd] = useState(false);
    const [newApp, setNewApp] = useState({
        company: '',
        position: '',
        status: 'Draft',
        url: '',
        location: '',
        salary: '',
        notes: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);

    const statuses = ['Draft', 'Applied', 'Interview', 'Offer', 'Rejected'];

    // Calculate status counts
    const statusCounts = useMemo(() => {
        const counts = {};
        statuses.forEach(status => {
            counts[status] = applications.filter(app => app.status === status).length;
        });
        return counts;
    }, [applications]);

    // Filter and search applications
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch =
                app.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                app.position?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchQuery, statusFilter]);

    const handleSave = async () => {
        if (!newApp.company) return;

        const appData = {
            ...newApp,
            date: newApp.date || new Date().toISOString().split('T')[0]
        };

        if (editingId) {
            await updateDocument(editingId, appData);
        } else {
            await addDocument(appData);
        }

        setShowAdd(false);
        setNewApp({ company: '', position: '', status: 'Draft', url: '', location: '', salary: '', notes: '' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            await deleteDocument(id);
        }
    };

    const handleEdit = (app) => {
        setNewApp({
            company: app.company || '',
            position: app.position || '',
            status: app.status || 'Draft',
            url: app.url || '',
            location: app.location || '',
            salary: app.salary || '',
            notes: app.notes || '',
            date: app.date || ''
        });
        setEditingId(app.id);
        setShowAdd(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Interview': return '#3b82f6';
            case 'Offer': return '#10b981';
            case 'Rejected': return '#ef4444';
            case 'Applied': return '#8b5cf6';
            case 'Draft': return '#6b7280';
            default: return '#6b7280';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Interview': return '💬';
            case 'Offer': return '🎉';
            case 'Rejected': return '❌';
            case 'Applied': return '📤';
            case 'Draft': return '📝';
            default: return '📋';
        }
    };

    const toggleSelect = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredApplications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredApplications.map(app => app.id));
        }
    };

    const bulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Delete ${selectedIds.length} selected applications?`)) return;

        for (const id of selectedIds) {
            await deleteDocument(id);
        }
        setSelectedIds([]);
    };

    const exportToCSV = () => {
        const dataToExport = selectedIds.length > 0
            ? applications.filter(app => selectedIds.includes(app.id))
            : filteredApplications;

        if (dataToExport.length === 0) {
            alert('No applications to export');
            return;
        }

        const headers = ['Company', 'Position', 'Status', 'Location', 'Salary', 'URL', 'Date', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...dataToExport.map(app => [
                app.company || '',
                app.position || '',
                app.status || '',
                app.location || '',
                app.salary || '',
                app.url || '',
                app.date || '',
                (app.notes || '').replace(/,/g, ';').replace(/\n/g, ' ')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applications_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div>Loading applications...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error loading applications: {error}</div>;
    }

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">Applications</h2>
                <button className="btn btn-primary" onClick={() => {
                    setShowAdd(!showAdd);
                    setEditingId(null);
                    setNewApp({ company: '', position: '', status: 'Draft', url: '', location: '', salary: '', notes: '' });
                }}>
                    {showAdd ? 'Cancel' : '+ New Application'}
                </button>
            </div>

            {/* Status Overview Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: 'var(--space-3)',
                marginBottom: 'var(--space-6)'
            }}>
                {statuses.map(status => (
                    <div
                        key={status}
                        className="card"
                        style={{
                            padding: 'var(--space-4)',
                            cursor: 'pointer',
                            border: statusFilter === status ? `2px solid ${getStatusColor(status)}` : '1px solid var(--border)',
                            transition: 'all 0.2s'
                        }}
                        onClick={() => setStatusFilter(statusFilter === status ? 'All' : status)}
                    >
                        <div style={{ fontSize: '24px', marginBottom: 'var(--space-2)' }}>
                            {getStatusIcon(status)}
                        </div>
                        <div style={{ fontSize: '28px', fontWeight: 'bold', color: getStatusColor(status) }}>
                            {statusCounts[status] || 0}
                        </div>
                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
                            {status}
                        </div>
                    </div>
                ))}
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3" style={{ marginBottom: 'var(--space-4)' }}>
                <input
                    type="text"
                    className="input"
                    placeholder="Search by company or position..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <select
                    className="input"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ width: '200px' }}
                >
                    <option value="All">All Statuses</option>
                    {statuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                    ))}
                </select>
            </div>

            {/* Bulk Actions Toolbar */}
            {filteredApplications.length > 0 && (
                <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3)', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                            onChange={selectAll}
                            style={{ cursor: 'pointer' }}
                        />
                        <span className="text-sm text-secondary">
                            {selectedIds.length > 0 ? `${selectedIds.length} selected` : 'Select all'}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '14px' }}
                            onClick={exportToCSV}
                        >
                            📥 Export {selectedIds.length > 0 ? 'Selected' : 'All'}
                        </button>
                        {selectedIds.length > 0 && (
                            <button
                                className="btn btn-outline"
                                style={{ padding: '6px 12px', fontSize: '14px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                onClick={bulkDelete}
                            >
                                🗑️ Delete Selected
                            </button>
                        )}
                    </div>
                </div>
            )}

            {showAdd && (
                <div className="card flex-col gap-4" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--primary)' }}>
                    <h3 className="text-xl">{editingId ? 'Edit Application' : 'Add Application'}</h3>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Company *</label>
                            <input
                                className="input"
                                placeholder="Company Name"
                                value={newApp.company}
                                onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                            />
                        </div>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Position *</label>
                            <input
                                className="input"
                                placeholder="Position"
                                value={newApp.position}
                                onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                            />
                        </div>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Status</label>
                            <select
                                className="input"
                                value={newApp.status}
                                onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                            >
                                {statuses.map(status => (
                                    <option key={status} value={status}>{status}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Location</label>
                            <input
                                className="input"
                                placeholder="e.g. Prague, Remote"
                                value={newApp.location}
                                onChange={(e) => setNewApp({ ...newApp, location: e.target.value })}
                            />
                        </div>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Job URL</label>
                            <input
                                className="input"
                                placeholder="https://..."
                                value={newApp.url}
                                onChange={(e) => setNewApp({ ...newApp, url: e.target.value })}
                            />
                        </div>
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Salary</label>
                            <input
                                className="input"
                                placeholder="e.g. 80k - 100k CZK"
                                value={newApp.salary}
                                onChange={(e) => setNewApp({ ...newApp, salary: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex-col gap-2">
                        <label className="text-sm text-secondary">Notes</label>
                        <textarea
                            className="input"
                            placeholder="Additional notes..."
                            value={newApp.notes}
                            onChange={(e) => setNewApp({ ...newApp, notes: e.target.value })}
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            {/* Applications List */}
            <div className="flex-col gap-3">
                {filteredApplications.length === 0 ? (
                    <p className="text-secondary">
                        {searchQuery || statusFilter !== 'All'
                            ? 'No applications match your filters.'
                            : 'No applications found. Add one to get started!'}
                    </p>
                ) : (
                    filteredApplications.map((app) => (
                        <div
                            key={app.id}
                            className="card"
                            style={{
                                padding: 'var(--space-4)',
                                transition: 'all 0.2s',
                                border: selectedIds.includes(app.id) ? '2px solid var(--primary)' : '1px solid var(--border)'
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(app.id)}
                                    onChange={() => toggleSelect(app.id)}
                                    style={{ marginTop: '4px', cursor: 'pointer' }}
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="flex justify-between items-start" style={{ flex: 1 }} onClick={() => setSelectedApp(app)}>
                                    <div className="flex-col" style={{ flex: 1, cursor: 'pointer' }}>
                                        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-2)' }}>
                                            <h3 className="text-lg" style={{ fontWeight: 500 }}>{app.company}</h3>
                                            <div
                                                className="badge"
                                                style={{
                                                    backgroundColor: getStatusColor(app.status) + '20',
                                                    color: getStatusColor(app.status),
                                                    border: `1px solid ${getStatusColor(app.status)}`
                                                }}
                                            >
                                                {getStatusIcon(app.status)} {app.status}
                                            </div>
                                        </div>
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                                            {app.position}
                                        </span>
                                        <div className="flex gap-4" style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: 'var(--space-2)' }}>
                                            {app.location && <span>📍 {app.location}</span>}
                                            {app.salary && <span>💰 {app.salary}</span>}
                                            {app.date && <span>📅 {app.date}</span>}
                                        </div>
                                    </div>
                                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                        {app.url && (
                                            <a
                                                href={app.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-outline"
                                                style={{ padding: '4px 8px', textDecoration: 'none' }}
                                            >
                                                🔗
                                            </a>
                                        )}
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 8px' }}
                                            onClick={() => handleEdit(app)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-outline"
                                            style={{ padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                            onClick={() => handleDelete(app.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Application Details Modal */}
            {selectedApp && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000
                    }}
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="card"
                        style={{
                            maxWidth: '600px',
                            width: '90%',
                            maxHeight: '80vh',
                            overflow: 'auto'
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start" style={{ marginBottom: 'var(--space-4)' }}>
                            <h2 className="text-2xl">{selectedApp.company}</h2>
                            <button
                                className="btn btn-outline"
                                style={{ padding: '4px 8px' }}
                                onClick={() => setSelectedApp(null)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="flex-col gap-4">
                            <div>
                                <div className="text-sm text-secondary">Position</div>
                                <div>{selectedApp.position}</div>
                            </div>
                            <div>
                                <div className="text-sm text-secondary">Status</div>
                                <div
                                    className="badge"
                                    style={{
                                        backgroundColor: getStatusColor(selectedApp.status) + '20',
                                        color: getStatusColor(selectedApp.status),
                                        border: `1px solid ${getStatusColor(selectedApp.status)}`,
                                        display: 'inline-block'
                                    }}
                                >
                                    {getStatusIcon(selectedApp.status)} {selectedApp.status}
                                </div>
                            </div>
                            {selectedApp.location && (
                                <div>
                                    <div className="text-sm text-secondary">Location</div>
                                    <div>{selectedApp.location}</div>
                                </div>
                            )}
                            {selectedApp.salary && (
                                <div>
                                    <div className="text-sm text-secondary">Salary</div>
                                    <div>{selectedApp.salary}</div>
                                </div>
                            )}
                            {selectedApp.url && (
                                <div>
                                    <div className="text-sm text-secondary">Job URL</div>
                                    <a href={selectedApp.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                                        {selectedApp.url}
                                    </a>
                                </div>
                            )}
                            {selectedApp.date && (
                                <div>
                                    <div className="text-sm text-secondary">Date Applied</div>
                                    <div>{selectedApp.date}</div>
                                </div>
                            )}
                            {selectedApp.notes && (
                                <div>
                                    <div className="text-sm text-secondary">Notes</div>
                                    <div style={{ whiteSpace: 'pre-wrap' }}>{selectedApp.notes}</div>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2" style={{ marginTop: 'var(--space-6)' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    handleEdit(selectedApp);
                                    setSelectedApp(null);
                                }}
                            >
                                Edit
                            </button>
                            <button
                                className="btn btn-outline"
                                style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                onClick={() => {
                                    handleDelete(selectedApp.id);
                                    setSelectedApp(null);
                                }}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
