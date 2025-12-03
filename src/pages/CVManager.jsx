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

                    // Save metadata to Firestore
                    await addDocument({
                        name: newCv.file.name,
                        role: newCv.role,
                        lang: newCv.lang,
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
                <button className="btn btn-primary" onClick={() => setShowUpload(!showUpload)}>
                    + Upload New CV
                </button>
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

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
                {cvs.length === 0 ? (
                    <p className="text-secondary">No CVs found. Upload one to get started!</p>
                ) : (
                    cvs.map((cv) => (
                        <div key={cv.id} className="card flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <div className="badge">{cv.lang}</div>
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
                    ))
                )}
            </div>
        </div>
    );
};
