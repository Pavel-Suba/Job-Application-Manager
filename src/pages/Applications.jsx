import React, { useState, useMemo, useEffect } from 'react';
import { useFirestore } from '../hooks/useFirestore';

// Editable Cell Component
const EditableCell = ({ value, onChange, type = 'text', options = [], onSave, autoFocus = true }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    if (isEditing) {
        if (type === 'select') {
            return (
                <select
                    className="input"
                    style={{ padding: '4px 8px', height: 'auto', minHeight: 'unset' }}
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onBlur={handleBlur}
                    autoFocus={autoFocus}
                >
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            );
        }
        return (
            <input
                className="input"
                style={{ padding: '4px 8px', height: 'auto', minHeight: 'unset' }}
                type={type}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                autoFocus={autoFocus}
            />
        );
    }

    return (
        <div
            onClick={() => setIsEditing(true)}
            style={{
                cursor: 'pointer',
                padding: '4px 8px',
                minHeight: '24px',
                borderRadius: '4px',
                border: '1px solid transparent',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
            }}
            className="hover:bg-white/5 hover:border-white/10"
        >
            {type === 'select' && currentValue === 'Draft' && '📝 Draft'}
            {type === 'select' && currentValue === 'Applied' && '📤 Applied'}
            {type === 'select' && currentValue === 'Interview' && '💬 Interview'}
            {type === 'select' && currentValue === 'Offer' && '🎉 Offer'}
            {type === 'select' && currentValue === 'Rejected' && '🚫 Rejected'}
            {type !== 'select' && (currentValue || <span className="text-secondary italic">Empty</span>)}
        </div>
    );
};

export const Applications = () => {
    const { docs: applications, addDocument, updateDocument, deleteDocument, loading, error } = useFirestore('applications');
    const { docs: aiOutputs } = useFirestore('aiOutputs');
    const { docs: masterProfiles } = useFirestore('masterProfiles');
    const [showAdd, setShowAdd] = useState(false);
    const [newApp, setNewApp] = useState({
        company: '',
        position: '',
        status: 'Draft',
        url: '',
        location: '',
        salary: '',
        notes: '',
        jobDescription: '',
        cvId: ''
    });
    const [editingId, setEditingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedApp, setSelectedApp] = useState(null); // For Sidebar
    const [selectedIds, setSelectedIds] = useState([]);

    // Column Management State
    const [columns, setColumns] = useState([
        { id: 'position', label: 'Position', visible: true, width: '200px' },
        { id: 'company', label: 'Company', visible: true, width: '150px' },
        { id: 'status', label: 'Status', visible: true, width: '120px' },
        { id: 'location', label: 'Place', visible: true, width: '120px' },
        { id: 'createdAt', label: 'Date Created', visible: true, width: '120px' },
        { id: 'date', label: 'Date Applied', visible: true, width: '120px' },
        { id: 'url', label: 'URL', visible: true, width: '80px' },
        { id: 'salary', label: 'Salary', visible: false, width: '100px' },
        { id: 'jobDescription', label: 'Job Description', visible: false, width: '150px' },
        { id: 'cv', label: 'CV', visible: true, width: '80px' },
        { id: 'coverLetter', label: 'Cover Letter', visible: true, width: '120px' },
        { id: 'tasks', label: 'Tasks', visible: false, width: '80px' },
        { id: 'notes', label: 'Notes', visible: true, width: '200px' }
    ]);
    const [showColumnMenu, setShowColumnMenu] = useState(false);

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
            const company = app.company || '';
            const position = app.position || '';
            const matchesSearch =
                company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                position.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [applications, searchQuery, statusFilter]);

    if (loading) return <div className="p-4">Loading applications...</div>;
    if (error) return <div className="p-4 text-danger">Error loading applications: {error}</div>;

    const handleSave = async () => {
        if (!newApp.company) return;

        let appData = {
            ...newApp,
            date: newApp.date || (newApp.status === 'Applied' ? new Date().toISOString().split('T')[0] : ''),
            createdAt: editingId ? undefined : new Date().toISOString().split('T')[0] // Only set on creation
        };

        // Clean undefined values
        Object.keys(appData).forEach(key => appData[key] === undefined && delete appData[key]);

        if (editingId) {
            await updateDocument(editingId, appData);
        } else {
            appData.history = [{
                status: newApp.status,
                date: new Date().toISOString().split('T')[0],
                note: 'Application created'
            }];
            await addDocument(appData);
        }

        setShowAdd(false);
        setNewApp({ company: '', position: '', status: 'Draft', url: '', location: '', salary: '', notes: '', jobDescription: '', cvId: '' });
        setEditingId(null);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this application?')) {
            await deleteDocument(id);
            if (selectedApp?.id === id) setSelectedApp(null);
        }
    };

    const handleInlineUpdate = async (id, field, value) => {
        await updateDocument(id, { [field]: value });
    };

    const toggleColumn = (columnId) => {
        setColumns(columns.map(col =>
            col.id === columnId ? { ...col, visible: !col.visible } : col
        ));
    };

    const moveColumn = (index, direction) => {
        const newColumns = [...columns];
        if (direction === 'up' && index > 0) {
            [newColumns[index], newColumns[index - 1]] = [newColumns[index - 1], newColumns[index]];
        } else if (direction === 'down' && index < newColumns.length - 1) {
            [newColumns[index], newColumns[index + 1]] = [newColumns[index + 1], newColumns[index]];
        }
        setColumns(newColumns);
    };

    const selectAll = () => {
        if (selectedIds.length === filteredApplications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredApplications.map(app => app.id));
        }
    };

    const toggleSelect = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const exportToCSV = () => {
        const appsToExport = selectedIds.length > 0
            ? applications.filter(app => selectedIds.includes(app.id))
            : applications;

        const headers = ['Company', 'Position', 'Status', 'Date Created', 'Date Applied', 'Location', 'Salary', 'URL', 'Notes'];
        const csvContent = [
            headers.join(','),
            ...appsToExport.map(app => [
                `"${app.company || ''}"`,
                `"${app.position || ''}"`,
                `"${app.status || ''}"`,
                `"${app.createdAt || ''}"`,
                `"${app.date || ''}"`,
                `"${app.location || ''}"`,
                `"${app.salary || ''}"`,
                `"${app.url || ''}"`,
                `"${app.notes || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `applications_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const formatDate = (date) => {
        if (!date) return '-';
        if (date.seconds) return new Date(date.seconds * 1000).toLocaleDateString(); // Firestore Timestamp
        return new Date(date).toLocaleDateString(); // String or Date
    };

    return (
        <div className="flex-col gap-6" style={{ height: '100%', overflow: 'hidden' }}>
            {/* Header */}
            <h1 className="text-3xl font-bold">Applications</h1>

            {/* Header Stats */}
            <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="card flex-col gap-1" style={{ minWidth: '120px', alignItems: 'center', padding: 'var(--space-3)' }}>
                    <span className="text-2xl font-bold">{applications.length}</span>
                    <span className="text-xs text-secondary uppercase tracking-wider">Total</span>
                </div>
                {statuses.map(status => (
                    <div key={status} className="card flex-col gap-1" style={{ minWidth: '120px', alignItems: 'center', padding: 'var(--space-3)' }}>
                        <span className="text-2xl font-bold">{statusCounts[status] || 0}</span>
                        <span className="text-xs text-secondary uppercase tracking-wider">{status}</span>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center flex-1">
                    <div style={{ position: 'relative', width: '300px' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                        <input
                            className="input"
                            placeholder="Search applications..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ paddingLeft: '36px' }}
                        />
                    </div>
                    <select
                        className="input"
                        style={{ width: '150px' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        {statuses.map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>
                </div>
                <div className="flex gap-4">
                    <div style={{ position: 'relative' }}>
                        <button
                            className="btn btn-outline"
                            onClick={() => setShowColumnMenu(!showColumnMenu)}
                        >
                            Columns ...
                        </button>
                        {showColumnMenu && (
                            <div className="card" style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                zIndex: 100,
                                width: '250px',
                                marginTop: '4px',
                                padding: 'var(--space-2)'
                            }}>
                                <div className="text-sm font-bold mb-2 px-2">Manage Columns</div>
                                {columns.map((col, idx) => (
                                    <div key={col.id} className="flex justify-between items-center p-2 hover:bg-white/5 rounded">
                                        <label className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={col.visible}
                                                onChange={() => toggleColumn(col.id)}
                                            />
                                            {col.label}
                                        </label>
                                        <div className="flex gap-1">
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                disabled={idx === 0}
                                                onClick={() => moveColumn(idx, 'up')}
                                                style={{ padding: '0 4px' }}
                                            >
                                                ↑
                                            </button>
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                disabled={idx === columns.length - 1}
                                                onClick={() => moveColumn(idx, 'down')}
                                                style={{ padding: '0 4px' }}
                                            >
                                                ↓
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button className="btn btn-primary" onClick={() => {
                        setEditingId(null);
                        setNewApp({ company: '', position: '', status: 'Draft', url: '', location: '', salary: '', notes: '', jobDescription: '', cvId: '' });
                        setShowAdd(true);
                    }}>
                        + New Application
                    </button>
                </div>
            </div>

            {/* Bulk Actions */}
            {selectedIds.length > 0 && (
                <div className="flex items-center gap-3 p-2 bg-white/5 rounded-md">
                    <span className="text-sm">{selectedIds.length} selected</span>
                    <button className="btn btn-outline btn-sm" onClick={exportToCSV}>Export CSV</button>
                    <button className="btn btn-outline btn-sm text-danger" onClick={() => {
                        if (window.confirm(`Delete ${selectedIds.length} applications?`)) {
                            selectedIds.forEach(id => deleteDocument(id));
                            setSelectedIds([]);
                        }
                    }}>Delete Selected</button>
                </div>
            )}

            {/* Table View */}
            <div className="card" style={{ flex: 1, overflow: 'hidden', padding: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ overflow: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1000px' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-card)', zIndex: 10 }}>
                            <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '12px', width: '40px' }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                                        onChange={selectAll}
                                    />
                                </th>
                                <th style={{ padding: '12px', width: '40px' }}></th> {/* Expand Button Column */}
                                {columns.filter(c => c.visible).map(col => (
                                    <th key={col.id} style={{ padding: '12px', textAlign: 'left', minWidth: col.width, color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: '600' }}>
                                        {col.label}
                                    </th>
                                ))}
                                <th style={{ padding: '12px', width: '60px' }}></th> {/* Actions */}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map(app => (
                                <tr key={app.id} style={{ borderBottom: '1px solid var(--border)', backgroundColor: selectedApp?.id === app.id ? 'rgba(59, 130, 246, 0.1)' : 'transparent' }}>
                                    <td style={{ padding: '12px' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.includes(app.id)}
                                            onChange={() => toggleSelect(app.id)}
                                        />
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => setSelectedApp(selectedApp?.id === app.id ? null : app)}
                                            style={{ padding: '4px' }}
                                        >
                                            {selectedApp?.id === app.id ? '▼' : '▶'}
                                        </button>
                                    </td>
                                    {columns.filter(c => c.visible).map(col => (
                                        <td key={col.id} style={{ padding: '8px 12px', verticalAlign: 'middle' }}>
                                            {col.id === 'position' && (
                                                <EditableCell value={app.position} onSave={(val) => handleInlineUpdate(app.id, 'position', val)} />
                                            )}
                                            {col.id === 'company' && (
                                                <EditableCell value={app.company} onSave={(val) => handleInlineUpdate(app.id, 'company', val)} />
                                            )}
                                            {col.id === 'status' && (
                                                <EditableCell
                                                    value={app.status}
                                                    type="select"
                                                    options={statuses}
                                                    onSave={(val) => handleInlineUpdate(app.id, 'status', val)}
                                                />
                                            )}
                                            {col.id === 'location' && (
                                                <EditableCell value={app.location} onSave={(val) => handleInlineUpdate(app.id, 'location', val)} />
                                            )}
                                            {col.id === 'createdAt' && (
                                                <span className="text-sm text-secondary">{formatDate(app.createdAt)}</span>
                                            )}
                                            {col.id === 'date' && (
                                                <EditableCell value={app.date} type="date" onSave={(val) => handleInlineUpdate(app.id, 'date', val)} />
                                            )}
                                            {col.id === 'url' && (
                                                <div className="flex items-center gap-2" style={{ maxWidth: '100px', overflow: 'hidden' }}>
                                                    {app.url && <a href={app.url} target="_blank" rel="noopener noreferrer">🔗</a>}
                                                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.8rem' }}>
                                                        <EditableCell value={app.url} onSave={(val) => handleInlineUpdate(app.id, 'url', val)} />
                                                    </div>
                                                </div>
                                            )}
                                            {col.id === 'salary' && (
                                                <EditableCell value={app.salary} onSave={(val) => handleInlineUpdate(app.id, 'salary', val)} />
                                            )}
                                            {col.id === 'jobDescription' && (
                                                <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                    {app.jobDescription || '-'}
                                                </div>
                                            )}
                                            {col.id === 'cv' && (
                                                <span className="text-xs text-secondary">
                                                    {app.cvId ? (masterProfiles.find(p => p.id === app.cvId)?.name || 'Linked') : (aiOutputs.some(o => o.applicationId === app.id && o.type === 'cvOptimization') ? '✅ Optimized' : '-')}
                                                </span>
                                            )}
                                            {col.id === 'coverLetter' && (
                                                <span className="text-xs text-secondary">
                                                    {aiOutputs.some(o => o.applicationId === app.id && o.type === 'coverLetter') ? '✅ Generated' : '-'}
                                                </span>
                                            )}
                                            {col.id === 'tasks' && (
                                                <span className="text-xs text-secondary">
                                                    {app.tasks && app.tasks.length > 0
                                                        ? `${app.tasks.filter(t => t.completed).length}/${app.tasks.length}`
                                                        : '-'}
                                                </span>
                                            )}
                                            {col.id === 'notes' && (
                                                <EditableCell value={app.notes} onSave={(val) => handleInlineUpdate(app.id, 'notes', val)} />
                                            )}
                                        </td>
                                    ))}
                                    <td style={{ padding: '12px' }}>
                                        <button
                                            className="btn btn-ghost btn-sm text-danger"
                                            onClick={() => handleDelete(app.id)}
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sidebar / Drawer */}
            {selectedApp && (
                <div className="card" style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: '500px',
                    zIndex: 1000,
                    borderRadius: '0',
                    borderLeft: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '-4px 0 20px rgba(0,0,0,0.5)'
                }}>
                    <div className="flex justify-between items-start p-4 border-b border-white/10">
                        <div>
                            <h2 className="text-xl font-bold">{selectedApp.position || 'Untitled Position'}</h2>
                            <p className="text-secondary">{selectedApp.company || 'Unknown Company'}</p>
                        </div>
                        <button className="btn btn-ghost" onClick={() => setSelectedApp(null)}>✕</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex-col gap-6">
                        {/* Status & Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Status</label>
                                <select
                                    className="input"
                                    value={selectedApp.status}
                                    onChange={(e) => handleInlineUpdate(selectedApp.id, 'status', e.target.value)}
                                >
                                    {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Date Applied</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={selectedApp.date || ''}
                                    onChange={(e) => handleInlineUpdate(selectedApp.id, 'date', e.target.value)}
                                />
                            </div>
                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Location</label>
                                <input
                                    className="input"
                                    value={selectedApp.location || ''}
                                    onChange={(e) => handleInlineUpdate(selectedApp.id, 'location', e.target.value)}
                                />
                            </div>
                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Salary</label>
                                <input
                                    className="input"
                                    value={selectedApp.salary || ''}
                                    onChange={(e) => handleInlineUpdate(selectedApp.id, 'salary', e.target.value)}
                                />
                            </div>
                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Linked CV</label>
                                <select
                                    className="input"
                                    value={selectedApp.cvId || ''}
                                    onChange={(e) => handleInlineUpdate(selectedApp.id, 'cvId', e.target.value)}
                                >
                                    <option value="">Select Master Profile...</option>
                                    {masterProfiles.map(p => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div className="flex-col gap-2">
                            <label className="text-sm font-bold">Job Description</label>
                            <textarea
                                className="input"
                                rows={6}
                                value={selectedApp.jobDescription || ''}
                                onChange={(e) => handleInlineUpdate(selectedApp.id, 'jobDescription', e.target.value)}
                                placeholder="Paste job description here..."
                                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                            />
                        </div>

                        {/* Tasks Section */}
                        <div className="flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold">Tasks</label>
                                <button
                                    className="btn btn-outline btn-sm text-xs"
                                    onClick={async () => {
                                        const task = prompt('Enter new task:');
                                        if (task) {
                                            const newTasks = [...(selectedApp.tasks || []), { id: Date.now(), text: task, completed: false }];
                                            await updateDocument(selectedApp.id, { tasks: newTasks });
                                            setSelectedApp({ ...selectedApp, tasks: newTasks });
                                        }
                                    }}
                                >
                                    + Add Task
                                </button>
                            </div>
                            <div className="flex-col gap-2">
                                {(selectedApp.tasks || []).map(task => (
                                    <div key={task.id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={task.completed}
                                            onChange={async () => {
                                                const newTasks = selectedApp.tasks.map(t =>
                                                    t.id === task.id ? { ...t, completed: !t.completed } : t
                                                );
                                                await updateDocument(selectedApp.id, { tasks: newTasks });
                                                setSelectedApp({ ...selectedApp, tasks: newTasks });
                                            }}
                                        />
                                        <span style={{ textDecoration: task.completed ? 'line-through' : 'none', color: task.completed ? 'var(--text-secondary)' : 'inherit' }}>
                                            {task.text}
                                        </span>
                                        <button
                                            className="btn btn-ghost btn-sm text-danger ml-auto"
                                            onClick={async () => {
                                                const newTasks = selectedApp.tasks.filter(t => t.id !== task.id);
                                                await updateDocument(selectedApp.id, { tasks: newTasks });
                                                setSelectedApp({ ...selectedApp, tasks: newTasks });
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {(!selectedApp.tasks || selectedApp.tasks.length === 0) && (
                                    <div className="text-sm text-secondary italic">No tasks yet.</div>
                                )}
                            </div>
                        </div>

                        {/* Documents Section */}
                        <div className="flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-bold">Documents</label>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-outline btn-sm text-xs"
                                        onClick={async () => {
                                            const name = prompt('Document Name (e.g. My CV):');
                                            if (!name) return;
                                            const url = prompt('Document Link/URL (optional):');

                                            const newDoc = { id: Date.now(), name, url: url || '#', type: 'custom', date: new Date().toISOString() };
                                            const newDocs = [...(selectedApp.customDocs || []), newDoc];

                                            await updateDocument(selectedApp.id, { customDocs: newDocs });
                                            setSelectedApp({ ...selectedApp, customDocs: newDocs });
                                        }}
                                    >
                                        + Add Document
                                    </button>
                                </div>
                            </div>

                            {/* AI Generated Docs */}
                            {aiOutputs.filter(o => o.applicationId === selectedApp.id).map(doc => (
                                <div key={doc.id} className="card p-3 bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">
                                            {doc.type === 'coverLetter' ? '📝' : doc.type === 'cvOptimization' ? '📄' : '🔍'}
                                        </span>
                                        <div className="flex-col">
                                            <span className="text-sm font-medium">
                                                {doc.type === 'coverLetter' ? 'Cover Letter (AI)' : doc.type === 'cvOptimization' ? 'Optimized CV (AI)' : 'Job Analysis'}
                                            </span>
                                            <span className="text-xs text-secondary">{new Date(doc.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="btn btn-ghost btn-sm">👁️</button>
                                        {doc.type === 'coverLetter' && (
                                            <button
                                                className="btn btn-ghost btn-sm"
                                                onClick={() => window.location.href = `/cover-letters?edit=${doc.id}`}
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Custom Docs */}
                            {(selectedApp.customDocs || []).map(doc => (
                                <div key={doc.id} className="card p-3 bg-white/5 border border-white/10 flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">📎</span>
                                        <div className="flex-col">
                                            <span className="text-sm font-medium">{doc.name}</span>
                                            <span className="text-xs text-secondary">{new Date(doc.date).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {doc.url && doc.url !== '#' && (
                                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm">🔗</a>
                                        )}
                                        <button
                                            className="btn btn-ghost btn-sm text-danger"
                                            onClick={async () => {
                                                const newDocs = selectedApp.customDocs.filter(d => d.id !== doc.id);
                                                await updateDocument(selectedApp.id, { customDocs: newDocs });
                                                setSelectedApp({ ...selectedApp, customDocs: newDocs });
                                            }}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {(!selectedApp.customDocs || selectedApp.customDocs.length === 0) && aiOutputs.filter(o => o.applicationId === selectedApp.id).length === 0 && (
                                <div className="text-center p-4 border border-dashed border-white/20 rounded text-secondary text-sm">
                                    No documents yet.
                                </div>
                            )}
                        </div>

                        {/* Notes */}
                        <div className="flex-col gap-2">
                            <label className="text-sm font-bold">Notes</label>
                            <textarea
                                className="input"
                                rows={4}
                                value={selectedApp.notes || ''}
                                onChange={(e) => handleInlineUpdate(selectedApp.id, 'notes', e.target.value)}
                                placeholder="Add notes..."
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add Modal (Simplified) */}
            {showAdd && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
                }}>
                    <div className="card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2 className="text-xl mb-4 font-bold">{editingId ? 'Edit Application' : 'New Application'}</h2>
                        <div className="flex-col gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex-col gap-1">
                                    <label className="text-xs text-secondary uppercase">Company</label>
                                    <input className="input" placeholder="Company Name" value={newApp.company} onChange={e => setNewApp({ ...newApp, company: e.target.value })} />
                                </div>
                                <div className="flex-col gap-1">
                                    <label className="text-xs text-secondary uppercase">Position</label>
                                    <input className="input" placeholder="Job Title" value={newApp.position} onChange={e => setNewApp({ ...newApp, position: e.target.value })} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex-col gap-1">
                                    <label className="text-xs text-secondary uppercase">Status</label>
                                    <select className="input" value={newApp.status} onChange={e => setNewApp({ ...newApp, status: e.target.value })}>
                                        {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="flex-col gap-1">
                                    <label className="text-xs text-secondary uppercase">CV Profile</label>
                                    <select className="input" value={newApp.cvId} onChange={e => setNewApp({ ...newApp, cvId: e.target.value })}>
                                        <option value="">Select Master Profile...</option>
                                        {masterProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">URL</label>
                                <input className="input" placeholder="https://..." value={newApp.url} onChange={e => setNewApp({ ...newApp, url: e.target.value })} />
                            </div>

                            <div className="flex-col gap-1">
                                <label className="text-xs text-secondary uppercase">Job Description</label>
                                <textarea
                                    className="input"
                                    rows={5}
                                    placeholder="Paste the full job description here..."
                                    value={newApp.jobDescription}
                                    onChange={e => setNewApp({ ...newApp, jobDescription: e.target.value })}
                                    style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
                                <button className="btn btn-outline" onClick={() => setShowAdd(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave}>Save Application</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
