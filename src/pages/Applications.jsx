import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';

export const Applications = () => {
    const { docs: applications, addDocument, deleteDocument, loading, error } = useFirestore('applications');
    const [showAdd, setShowAdd] = useState(false);
    const [newApp, setNewApp] = useState({ company: '', position: '', status: 'Draft' });
    const [editingId, setEditingId] = useState(null);

    const handleSave = async () => {
        if (!newApp.company) return;

        if (editingId) {
            // Logic for update would go here, but useFirestore currently only has add/delete.
            // For now, we'll delete and re-add (not ideal for ID preservation, but works for MVP)
            // TODO: Implement updateDocument in useFirestore
            await deleteDocument(editingId);
            await addDocument({ ...newApp, date: new Date().toISOString().split('T')[0] });
        } else {
            await addDocument({ ...newApp, date: new Date().toISOString().split('T')[0] });
        }

        setShowAdd(false);
        setNewApp({ company: '', position: '', status: 'Draft' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            await deleteDocument(id);
        }
    };

    const handleEdit = (app) => {
        setNewApp({ company: app.company, position: app.position, status: app.status });
        setEditingId(app.id);
        setShowAdd(true);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Interview': return 'var(--primary)';
            case 'Offer': return 'var(--success)';
            case 'Rejected': return 'var(--danger)';
            case 'Applied': return 'var(--accent)';
            default: return 'var(--text-secondary)';
        }
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
                    setNewApp({ company: '', position: '', status: 'Draft' });
                }}>
                    {showAdd ? 'Cancel' : '+ New Application'}
                </button>
            </div>

            {showAdd && (
                <div className="card flex-col gap-4" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--primary)' }}>
                    <h3 className="text-xl">{editingId ? 'Edit Application' : 'Add Application'}</h3>
                    <div className="flex gap-4">
                        <input
                            className="input"
                            placeholder="Company Name"
                            value={newApp.company}
                            onChange={(e) => setNewApp({ ...newApp, company: e.target.value })}
                        />
                        <input
                            className="input"
                            placeholder="Position"
                            value={newApp.position}
                            onChange={(e) => setNewApp({ ...newApp, position: e.target.value })}
                        />
                        <select
                            className="input"
                            value={newApp.status}
                            onChange={(e) => setNewApp({ ...newApp, status: e.target.value })}
                        >
                            <option>Draft</option>
                            <option>Applied</option>
                            <option>Interview</option>
                            <option>Offer</option>
                            <option>Rejected</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {editingId ? 'Update' : 'Save'}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-col gap-4">
                {applications.length === 0 ? (
                    <p className="text-secondary">No applications found. Add one to get started!</p>
                ) : (
                    applications.map((app) => (
                        <div key={app.id} className="card flex justify-between items-center">
                            <div className="flex-col">
                                <h3 className="text-lg">{app.company}</h3>
                                <span className="text-sm text-secondary">{app.position}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-secondary">{app.date}</span>
                                <div className="badge" style={{ color: getStatusColor(app.status), backgroundColor: `rgba(255,255,255,0.05)` }}>
                                    {app.status}
                                </div>
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
                    ))
                )}
            </div>
        </div>
    );
};
