import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useStorage } from '../hooks/useStorage';
import { getDownloadURL } from 'firebase/storage';

export const CVManager = () => {
    const { docs: cvs, addDocument, deleteDocument, loading: loadingDocs, error } = useFirestore('cvs');
    const { uploadFile, progress, error: uploadError, url } = useStorage();

    const [showUpload, setShowUpload] = useState(false);
    const [newCv, setNewCv] = useState({ name: '', role: 'Mendix Dev', lang: 'EN', file: null });
    const [isUploading, setIsUploading] = useState(false);

    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

    const handleUpload = async () => {
        if (!newCv.file) return;

        setIsUploading(true);
        try {
            const uploadTask = uploadFile(newCv.file, 'cvs');

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    // Progress is handled by hook's state, but we need to wait for completion here
                },
                (error) => {
                    console.error("Upload failed:", error);
                    setIsUploading(false);
                },
                async () => {
                    // Upload completed successfully, now get the download URL
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // Calculate version number
                    const baseName = `${newCv.role}_${newCv.lang}`;
                    const existingVersions = cvs.filter(cv =>
                        cv.baseName === baseName
                    );
                    const version = existingVersions.length + 1;

                    // Save metadata to Firestore
                    await addDocument({
                        name: newCv.file.name,
                        role: newCv.role,
                        lang: newCv.lang,
                        baseName: baseName,
                        version: version,
                        downloadURL: downloadURL,
                        date: new Date().toISOString().split('T')[0]
                    });

                    setIsUploading(false);
                    setShowUpload(false);
                    setNewCv({ name: '', role: 'Mendix Dev', lang: 'EN', file: null });
                }
            );
        } catch (err) {
            console.error(err);
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this CV?')) {
            await deleteDocument(id);
            // Note: This only deletes the metadata. To delete the file from Storage, we'd need a deleteFile function in useStorage.
            // For now, we'll just delete the record.
        }
    };

    if (loadingDocs) {
        return <div>Loading CVs...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error loading CVs: {error}</div>;
    }

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">CV Manager</h2>
                <div className="flex gap-3">
                    <div className="flex" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                        <button
                            className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '4px 12px', fontSize: '14px' }}
                            onClick={() => setViewMode('grid')}
                        >
                            Grid
                        </button>
                        <button
                            className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '4px 12px', fontSize: '14px' }}
                            onClick={() => setViewMode('table')}
                        >
                            Table
                        </button>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
                        + Upload New CV
                    </button>
                </div>
            </div>

            {showUpload && (
                <div className="card flex-col gap-4" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--primary)' }}>
                    <h3 className="text-xl">Add New CV</h3>
                    <div className="flex gap-4">
                        <div className="flex-col gap-2" style={{ flex: 1 }}>
                            <label className="text-sm text-secondary">Role</label>
                            <select
                                className="input"
                                value={newCv.role}
                                onChange={(e) => setNewCv({ ...newCv, role: e.target.value })}
                            >
                                <option>Mendix Dev</option>
                                <option>Data Analyst</option>
                                <option>Support</option>
                                <option>Frontend Dev</option>
                            </select>
                        </div>
                        <div className="flex-col gap-2" style={{ flex: 1 }}>
                            <label className="text-sm text-secondary">Language</label>
                            <select
                                className="input"
                                value={newCv.lang}
                                onChange={(e) => setNewCv({ ...newCv, lang: e.target.value })}
                            >
                                <option>EN</option>
                                <option>CZ</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex-col gap-2">
                        <label className="text-sm text-secondary">Select File (PDF)</label>
                        <input
                            type="file"
                            accept=".pdf"
                            className="input"
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setNewCv({ ...newCv, file: file, name: file.name });
                                }
                            }}
                        />
                    </div>

                    {isUploading && (
                        <div style={{ width: '100%', backgroundColor: '#eee', borderRadius: '4px', height: '8px' }}>
                            <div style={{ width: `${progress}%`, backgroundColor: 'var(--primary)', height: '100%', borderRadius: '4px', transition: 'width 0.3s' }}></div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <button className="btn btn-outline" onClick={() => setShowUpload(false)} disabled={isUploading}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleUpload} disabled={isUploading || !newCv.file}>
                            {isUploading ? 'Uploading...' : 'Upload'}
                        </button>
                    </div>
                </div>
            )}

            {cvs.length === 0 ? (
                <p className="text-secondary">No CVs found. Upload one to get started!</p>
            ) : (
                viewMode === 'grid' ? (
                    <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                        {cvs.map((cv) => (
                            <div key={cv.id} className="card flex-col gap-2">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-2">
                                        <div className="badge">{cv.lang}</div>
                                        {cv.version && (
                                            <div className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                                                v{cv.version}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-sm text-secondary">{cv.date}</span>
                                </div>
                                <h3 className="text-lg" style={{ fontWeight: 500 }}>{cv.role}</h3>
                                <p className="text-sm text-secondary" style={{ wordBreak: 'break-all' }}>{cv.name}</p>
                                <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
                                    <a
                                        href={cv.downloadURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', textDecoration: 'none' }}
                                    >
                                        View / Download
                                    </a>
                                    <button
                                        className="btn btn-outline"
                                        style={{ fontSize: '0.8rem', padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(cv.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Role</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Language</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Filename</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Date</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cvs.map((cv) => (
                                    <tr key={cv.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <div className="flex items-center gap-2">
                                                {cv.role}
                                                {cv.version && (
                                                    <span className="badge" style={{ fontSize: '0.7rem', backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6' }}>
                                                        v{cv.version}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <span className="badge" style={{ fontSize: '0.8rem' }}>{cv.lang}</span>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{cv.name}</td>
                                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>{cv.date}</td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                                            <div className="flex justify-end gap-2">
                                                <a
                                                    href={cv.downloadURL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '4px 8px', textDecoration: 'none' }}
                                                >
                                                    View
                                                </a>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(cv.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
            )}
        </div>
    );
};
