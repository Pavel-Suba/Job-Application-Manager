import React, { useState } from 'react';
import { useGemini } from '../hooks/useGemini';
import { useFirestore } from '../hooks/useFirestore';

export const AIAssistant = () => {
    const [activeTab, setActiveTab] = useState('analyze');
    const { loading, error, result, analyzeJobDescription, generateCoverLetter, suggestCVImprovements } = useGemini();
    const { docs: cvs } = useFirestore('cvs');

    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [selectedCv, setSelectedCv] = useState('');
    const [cvText, setCvText] = useState('');

    const handleAnalyze = async () => {
        if (!jobDescriptionText.trim()) return;
        await analyzeJobDescription(jobDescriptionText);
    };

    const handleGenerateCoverLetter = async () => {
        if (!jobDescriptionText.trim() || !selectedCv) return;
        const cv = cvs.find(c => c.id === selectedCv);
        await generateCoverLetter(jobDescriptionText, cv || {});
    };

    const handleOptimizeCV = async () => {
        if (!jobDescriptionText.trim() || !cvText.trim()) return;
        await suggestCVImprovements(cvText, jobDescriptionText);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">✨ AI Assistant</h2>
            </div>

            {/* Tabs */}
            <div className="flex gap-2" style={{ marginBottom: 'var(--space-4)' }}>
                <button
                    className={`btn ${activeTab === 'analyze' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('analyze')}
                >
                    Job Analysis
                </button>
                <button
                    className={`btn ${activeTab === 'cover-letter' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('cover-letter')}
                >
                    Cover Letter
                </button>
                <button
                    className={`btn ${activeTab === 'cv-optimizer' ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab('cv-optimizer')}
                >
                    CV Optimizer
                </button>
            </div>

            {/* Job Analysis Tab */}
            {activeTab === 'analyze' && (
                <div className="flex-col gap-4">
                    <div className="card flex-col gap-4">
                        <h3 className="text-xl">Analyze Job Description</h3>
                        <p className="text-sm text-secondary">
                            Paste a job description and AI will extract key information like required skills, responsibilities, and requirements.
                        </p>
                        <textarea
                            className="input"
                            placeholder="Paste job description here..."
                            value={jobDescriptionText}
                            onChange={(e) => setJobDescriptionText(e.target.value)}
                            rows={10}
                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />
                        <button
                            className="btn btn-primary"
                            onClick={handleAnalyze}
                            disabled={loading || !jobDescriptionText.trim()}
                        >
                            {loading ? 'Analyzing...' : 'Analyze'}
                        </button>
                    </div>

                    {error && (
                        <div className="card" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--danger)' }}>
                            <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
                        </div>
                    )}

                    {result && !loading && (
                        <div className="card flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl">Analysis Results</h3>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
                                >
                                    Copy JSON
                                </button>
                            </div>

                            {result.company && (
                                <div>
                                    <strong>Company:</strong> {result.company}
                                </div>
                            )}
                            {result.position && (
                                <div>
                                    <strong>Position:</strong> {result.position}
                                </div>
                            )}
                            {result.summary && (
                                <div>
                                    <strong>Summary:</strong>
                                    <p className="text-secondary">{result.summary}</p>
                                </div>
                            )}
                            {result.keySkills && result.keySkills.length > 0 && (
                                <div>
                                    <strong>Key Skills:</strong>
                                    <ul style={{ marginLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                                        {result.keySkills.map((skill, i) => (
                                            <li key={i} className="text-secondary">{skill}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {result.requirements && result.requirements.length > 0 && (
                                <div>
                                    <strong>Requirements:</strong>
                                    <ul style={{ marginLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                                        {result.requirements.map((req, i) => (
                                            <li key={i} className="text-secondary">{req}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {result.responsibilities && result.responsibilities.length > 0 && (
                                <div>
                                    <strong>Responsibilities:</strong>
                                    <ul style={{ marginLeft: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
                                        {result.responsibilities.map((resp, i) => (
                                            <li key={i} className="text-secondary">{resp}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Cover Letter Tab */}
            {activeTab === 'cover-letter' && (
                <div className="flex-col gap-4">
                    <div className="card flex-col gap-4">
                        <h3 className="text-xl">Generate Cover Letter</h3>
                        <p className="text-sm text-secondary">
                            Select a CV and provide a job description to generate a personalized cover letter.
                        </p>

                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Select CV</label>
                            <select
                                className="input"
                                value={selectedCv}
                                onChange={(e) => setSelectedCv(e.target.value)}
                            >
                                <option value="">-- Select a CV --</option>
                                {cvs.map((cv) => (
                                    <option key={cv.id} value={cv.id}>
                                        {cv.role} ({cv.lang}) - {cv.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <textarea
                            className="input"
                            placeholder="Paste job description here..."
                            value={jobDescriptionText}
                            onChange={(e) => setJobDescriptionText(e.target.value)}
                            rows={8}
                            style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                        />

                        <button
                            className="btn btn-primary"
                            onClick={handleGenerateCoverLetter}
                            disabled={loading || !jobDescriptionText.trim() || !selectedCv}
                        >
                            {loading ? 'Generating...' : 'Generate Cover Letter'}
                        </button>
                    </div>

                    {error && (
                        <div className="card" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--danger)' }}>
                            <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
                        </div>
                    )}

                    {result && !loading && typeof result === 'string' && (
                        <div className="card flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl">Generated Cover Letter</h3>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => copyToClipboard(result)}
                                >
                                    Copy
                                </button>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CV Optimizer Tab */}
            {activeTab === 'cv-optimizer' && (
                <div className="flex-col gap-4">
                    <div className="card flex-col gap-4">
                        <h3 className="text-xl">CV Optimizer</h3>
                        <p className="text-sm text-secondary">
                            Paste your CV content and a job description to get AI-powered suggestions for improvement.
                        </p>

                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Your CV Content</label>
                            <textarea
                                className="input"
                                placeholder="Paste your CV text here..."
                                value={cvText}
                                onChange={(e) => setCvText(e.target.value)}
                                rows={8}
                                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                        </div>

                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Job Description</label>
                            <textarea
                                className="input"
                                placeholder="Paste job description here..."
                                value={jobDescriptionText}
                                onChange={(e) => setJobDescriptionText(e.target.value)}
                                rows={6}
                                style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}
                            />
                        </div>

                        <button
                            className="btn btn-primary"
                            onClick={handleOptimizeCV}
                            disabled={loading || !jobDescriptionText.trim() || !cvText.trim()}
                        >
                            {loading ? 'Analyzing...' : 'Get Suggestions'}
                        </button>
                    </div>

                    {error && (
                        <div className="card" style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid var(--danger)' }}>
                            <p style={{ color: 'var(--danger)' }}>Error: {error}</p>
                        </div>
                    )}

                    {result && !loading && typeof result === 'string' && (
                        <div className="card flex-col gap-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl">Optimization Suggestions</h3>
                                <button
                                    className="btn btn-outline"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => copyToClipboard(result)}
                                >
                                    Copy
                                </button>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
