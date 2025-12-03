import React, { useState, useEffect } from 'react';

export const Profile = () => {
    const [masterData, setMasterData] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const savedData = localStorage.getItem('masterData');
        if (savedData) {
            setMasterData(savedData);
        }
    }, []);

    const handleSave = () => {
        localStorage.setItem('masterData', masterData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(masterData);
        alert('Copied to clipboard!');
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">Master Profile</h2>
                <div className="flex gap-2">
                    <button className="btn btn-outline" onClick={handleCopy}>
                        📋 Copy for AI
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        {isSaved ? 'Saved!' : 'Save Profile'}
                    </button>
                </div>
            </div>

            <div className="card flex-col gap-4">
                <div className="flex-col gap-2">
                    <label className="text-sm text-secondary">
                        Paste your full professional profile here. This will be used as the "Source of Truth" for AI prompts.
                        Include your experience, skills, projects, and education.
                    </label>
                    <textarea
                        className="input"
                        style={{ minHeight: '400px', fontFamily: 'monospace', lineHeight: '1.6', resize: 'vertical' }}
                        value={masterData}
                        onChange={(e) => setMasterData(e.target.value)}
                        placeholder="I am Pavel Šuba, a Mendix Developer with experience in..."
                    />
                </div>
            </div>
        </div>
    );
};
