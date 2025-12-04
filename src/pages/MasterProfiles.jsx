import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';

export const MasterProfiles = () => {
    const { docs: profiles, addDocument, updateDocument, deleteDocument, loading, error } = useFirestore('masterProfiles');
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    const [inputMode, setInputMode] = useState('form'); // 'form' or 'text'

    const [formData, setFormData] = useState({
        name: '',
        personalInfo: {
            fullName: '',
            email: '',
            phone: '',
            location: ''
        },
        summary: '',
        skills: '',
        experience: '',
        education: '',
        languages: '',
        certifications: '',
        rawText: '' // For simple text mode
    });

    const handleSave = async () => {
        if (!formData.name) {
            alert('Profile name is required');
            return;
        }

        let profileData;

        if (inputMode === 'text') {
            // Simple text mode - save raw text
            profileData = {
                name: formData.name,
                rawText: formData.rawText,
                inputMode: 'text',
                updatedAt: new Date().toISOString()
            };
        } else {
            // Structured form mode
            profileData = {
                ...formData,
                skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
                languages: formData.languages.split(',').map(l => l.trim()).filter(Boolean),
                certifications: formData.certifications.split(',').map(c => c.trim()).filter(Boolean),
                inputMode: 'form',
                updatedAt: new Date().toISOString()
            };
        }

        if (editingId) {
            await updateDocument(editingId, profileData);
        } else {
            await addDocument({
                ...profileData,
                createdAt: new Date().toISOString()
            });
        }

        resetForm();
    };

    const handleEdit = (profile) => {
        if (profile.inputMode === 'text') {
            setFormData({
                name: profile.name || '',
                rawText: profile.rawText || '',
                personalInfo: { fullName: '', email: '', phone: '', location: '' },
                summary: '',
                skills: '',
                experience: '',
                education: '',
                languages: '',
                certifications: ''
            });
            setInputMode('text');
        } else {
            setFormData({
                name: profile.name || '',
                personalInfo: profile.personalInfo || { fullName: '', email: '', phone: '', location: '' },
                summary: profile.summary || '',
                skills: Array.isArray(profile.skills) ? profile.skills.join(', ') : '',
                experience: profile.experience || '',
                education: profile.education || '',
                languages: Array.isArray(profile.languages) ? profile.languages.join(', ') : '',
                certifications: Array.isArray(profile.certifications) ? profile.certifications.join(', ') : '',
                rawText: ''
            });
            setInputMode('form');
        }
        setEditingId(profile.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this profile?')) {
            await deleteDocument(id);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            personalInfo: { fullName: '', email: '', phone: '', location: '' },
            summary: '',
            skills: '',
            experience: '',
            education: '',
            languages: '',
            certifications: '',
            rawText: ''
        });
        setEditingId(null);
        setShowForm(false);
        setInputMode('form');
    };

    if (loading) return <div>Loading profiles...</div>;
    if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">Master Profiles</h2>
                <div className="flex gap-3">
                    {profiles.length > 0 && (
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
                    )}
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancel' : '+ New Profile'}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card flex-col gap-4" style={{ marginBottom: 'var(--space-6)', border: '1px solid var(--primary)' }}>
                    <h3 className="text-xl">{editingId ? 'Edit Profile' : 'Create New Profile'}</h3>

                    <div className="flex-col gap-2">
                        <label className="text-sm text-secondary">Profile Name *</label>
                        <input
                            className="input"
                            placeholder="e.g., Tech Profile, Management Profile"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    {/* Input Mode Toggle */}
                    <div className="flex" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '2px', width: 'fit-content' }}>
                        <button
                            className={`btn ${inputMode === 'form' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '6px 16px', fontSize: '14px' }}
                            onClick={() => setInputMode('form')}
                        >
                            📝 Structured Form
                        </button>
                        <button
                            className={`btn ${inputMode === 'text' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ padding: '6px 16px', fontSize: '14px' }}
                            onClick={() => setInputMode('text')}
                        >
                            📄 Simple Text
                        </button>
                    </div>

                    {inputMode === 'text' ? (
                        /* Simple Text Mode */
                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Profile Information</label>
                            <textarea
                                className="input"
                                rows={20}
                                placeholder="Paste your complete profile information here...

Example:
John Doe
john.doe@email.com
+420 123 456 789
Prague, Czech Republic

Professional Summary:
Experienced software developer with 5+ years...

Skills: React, Node.js, Python, AWS

Experience:
- Senior Developer at Company X (2020-present)
  Description of role and achievements...

Education:
- Master's in Computer Science, University Y (2018)

Languages: English (fluent), Czech (native)

Certifications: AWS Certified Solutions Architect"
                                value={formData.rawText}
                                onChange={(e) => setFormData({ ...formData, rawText: e.target.value })}
                            />
                        </div>
                    ) : (
                        /* Structured Form Mode */
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Full Name</label>
                                    <input
                                        className="input"
                                        value={formData.personalInfo.fullName}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, fullName: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Email</label>
                                    <input
                                        className="input"
                                        type="email"
                                        value={formData.personalInfo.email}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, email: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Phone</label>
                                    <input
                                        className="input"
                                        value={formData.personalInfo.phone}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, phone: e.target.value }
                                        })}
                                    />
                                </div>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Location</label>
                                    <input
                                        className="input"
                                        value={formData.personalInfo.location}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            personalInfo: { ...formData.personalInfo, location: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>

                            <div className="flex-col gap-2">
                                <label className="text-sm text-secondary">Professional Summary</label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    placeholder="Brief overview of your professional background..."
                                    value={formData.summary}
                                    onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                />
                            </div>

                            <div className="flex-col gap-2">
                                <label className="text-sm text-secondary">Skills (comma-separated)</label>
                                <input
                                    className="input"
                                    placeholder="React, Node.js, Python, ..."
                                    value={formData.skills}
                                    onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                                />
                            </div>

                            <div className="flex-col gap-2">
                                <label className="text-sm text-secondary">Experience</label>
                                <textarea
                                    className="input"
                                    rows={6}
                                    placeholder="List your work experience..."
                                    value={formData.experience}
                                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                                />
                            </div>

                            <div className="flex-col gap-2">
                                <label className="text-sm text-secondary">Education</label>
                                <textarea
                                    className="input"
                                    rows={4}
                                    placeholder="List your education..."
                                    value={formData.education}
                                    onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-3)' }}>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Languages (comma-separated)</label>
                                    <input
                                        className="input"
                                        placeholder="English, Czech, ..."
                                        value={formData.languages}
                                        onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                    />
                                </div>
                                <div className="flex-col gap-2">
                                    <label className="text-sm text-secondary">Certifications (comma-separated)</label>
                                    <input
                                        className="input"
                                        placeholder="AWS Certified, PMP, ..."
                                        value={formData.certifications}
                                        onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-2">
                        <button className="btn btn-outline" onClick={resetForm}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {editingId ? 'Update' : 'Create'} Profile
                        </button>
                    </div>
                </div>
            )}

            {profiles.length === 0 ? (
                <p className="text-secondary">No profiles yet. Create one to get started!</p>
            ) : (
                viewMode === 'grid' ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 'var(--space-4)' }}>
                        {profiles.map((profile) => (
                            <div key={profile.id} className="card flex-col gap-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg" style={{ fontWeight: 500 }}>{profile.name}</h3>
                                        {profile.inputMode === 'text' && (
                                            <span className="badge" style={{ fontSize: '0.65rem', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6' }}>
                                                TEXT
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-secondary">
                                        {new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                {profile.inputMode === 'text' ? (
                                    <p className="text-sm text-secondary" style={{
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 4,
                                        WebkitBoxOrient: 'vertical',
                                        whiteSpace: 'pre-wrap'
                                    }}>
                                        {profile.rawText}
                                    </p>
                                ) : (
                                    <>
                                        {profile.personalInfo?.fullName && (
                                            <div className="text-sm">
                                                <strong>{profile.personalInfo.fullName}</strong>
                                            </div>
                                        )}

                                        {profile.summary && (
                                            <p className="text-sm text-secondary" style={{
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                display: '-webkit-box',
                                                WebkitLineClamp: 3,
                                                WebkitBoxOrient: 'vertical'
                                            }}>
                                                {profile.summary}
                                            </p>
                                        )}

                                        {profile.skills && profile.skills.length > 0 && (
                                            <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                                                {profile.skills.slice(0, 5).map((skill, idx) => (
                                                    <span key={idx} className="badge" style={{ fontSize: '0.7rem' }}>
                                                        {skill}
                                                    </span>
                                                ))}
                                                {profile.skills.length > 5 && (
                                                    <span className="badge" style={{ fontSize: '0.7rem' }}>
                                                        +{profile.skills.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </>
                                )}

                                <div className="flex gap-2" style={{ marginTop: 'var(--space-2)' }}>
                                    <button
                                        className="btn btn-outline"
                                        style={{ flex: 1, padding: '6px 12px', fontSize: '14px' }}
                                        onClick={() => handleEdit(profile)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '6px 12px', fontSize: '14px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                        onClick={() => handleDelete(profile.id)}
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
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Name</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Type</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Full Name</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Skills</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'left' }}>Updated</th>
                                    <th style={{ padding: 'var(--space-3)', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map((profile) => (
                                    <tr key={profile.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: 'var(--space-3)', fontWeight: 500 }}>{profile.name}</td>
                                        <td style={{ padding: 'var(--space-3)' }}>
                                            <span className="badge" style={{ fontSize: '0.7rem' }}>
                                                {profile.inputMode === 'text' ? 'Text' : 'Form'}
                                            </span>
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                                            {profile.personalInfo?.fullName || '-'}
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                                            {profile.skills?.length || 0} skills
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', color: 'var(--text-secondary)' }}>
                                            {new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: 'var(--space-3)', textAlign: 'right' }}>
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '4px 8px' }}
                                                    onClick={() => handleEdit(profile)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ fontSize: '0.8rem', padding: '4px 8px', borderColor: 'var(--danger)', color: 'var(--danger)' }}
                                                    onClick={() => handleDelete(profile.id)}
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
