import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGemini } from '../hooks/useGemini';
import { useFirestore } from '../hooks/useFirestore';

export const AIAssistant = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('analyze');
    const { loading, error, result, conversationHistory, analyzeJobDescription, generateCoverLetter, suggestCVImprovements, chatWithAI, resetConversation } = useGemini();
    const { docs: masterProfiles } = useFirestore('masterProfiles');
    const { addDocument: addCoverLetter } = useFirestore('coverLetters');
    const { docs: applications } = useFirestore('applications');
    const { addDocument: addAIOutput, docs: aiOutputs } = useFirestore('aiOutputs');

    const [jobDescriptionText, setJobDescriptionText] = useState('');
    const [selectedProfile, setSelectedProfile] = useState('');
    const [cvText, setCvText] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState('');
    const [outputType, setOutputType] = useState(''); // 'analysis', 'coverLetter', 'cvOptimization'
    const [chatMode, setChatMode] = useState(false); // Toggle between generate and chat mode
    const [chatInput, setChatInput] = useState('');

    const handleAnalyze = async () => {
        if (!jobDescriptionText.trim()) return;
        await analyzeJobDescription(jobDescriptionText);
    };

    const handleGenerateCoverLetter = async () => {
        if (!jobDescriptionText.trim() || !selectedProfile) return;
        const profile = masterProfiles.find(p => p.id === selectedProfile);
        const coverLetter = await generateCoverLetter(jobDescriptionText, profile || {});

        // If an application is selected, automatically save the cover letter to it
        if (selectedApplication && coverLetter) {
            await addAIOutput({
                applicationId: selectedApplication,
                type: 'coverLetter',
                content: coverLetter,
                originalPrompt: jobDescriptionText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }
    };

    const handleOptimizeCV = async () => {
        if (!jobDescriptionText.trim() || !cvText.trim()) return;
        await suggestCVImprovements(cvText, jobDescriptionText);
    };

    const handleSaveCoverLetter = async () => {
        if (!result || typeof result !== 'string') return;

        // Always save to Cover Letters collection
        await addCoverLetter({
            content: result,
            company: companyName || 'Untitled Application',
            position: 'Unknown',
            date: new Date().toISOString().split('T')[0],
            jobDescription: jobDescriptionText
        });

        // If application is selected, also save to AI outputs
        if (selectedApplication) {
            await addAIOutput({
                applicationId: selectedApplication,
                type: 'coverLetter',
                content: result,
                originalPrompt: jobDescriptionText,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        }

        alert('Cover letter saved successfully!');
    };

    const handleSaveToApplication = (type) => {
        setOutputType(type);
        setShowSaveModal(true);
    };

    const handleConfirmSave = async () => {
        if (!selectedApplication || !result) return;

        await addAIOutput({
            applicationId: selectedApplication,
            type: outputType,
            content: result,
            originalPrompt: jobDescriptionText,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        setShowSaveModal(false);
        setSelectedApplication('');
        alert('AI output saved to application!');
    };

    const handleSendChat = async () => {
        if (!chatInput.trim() || !result) return;

        // Use the current result as context for the chat
        const context = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
        await chatWithAI(chatInput, context);
        setChatInput('');
    };

    const handleToggleChatMode = () => {
        if (!chatMode) {
            // Switching to chat mode - keep current result as context
            setChatMode(true);
        } else {
            // Switching back to generate mode - reset conversation
            setChatMode(false);
            resetConversation();
        }
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

                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Select Saved Application (Optional)</label>
                            <select
                                className="input"
                                value={selectedApplication}
                                onChange={(e) => {
                                    const appId = e.target.value;
                                    setSelectedApplication(appId);

                                    if (appId) {
                                        const app = applications.find(a => a.id === appId);
                                        if (app) {
                                            setJobDescriptionText(app.jobDescription || '');
                                        }
                                    } else {
                                        setJobDescriptionText('');
                                    }
                                }}
                            >
                                <option value="">-- Or paste job description manually --</option>
                                {applications.map((app) => (
                                    <option key={app.id} value={app.id}>
                                        {app.company} - {app.position}
                                    </option>
                                ))}
                            </select>
                        </div>

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
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSaveToApplication('analysis')}
                                    style={{ fontSize: '0.9rem', padding: '6px 12px' }}
                                >
                                    💾 Save to Application
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
                            <label className="text-sm text-secondary">Select Master Profile</label>
                            <select
                                className="input"
                                value={selectedProfile}
                                onChange={(e) => setSelectedProfile(e.target.value)}
                            >
                                <option value="">-- Select a Profile --</option>
                                {masterProfiles.map((profile) => (
                                    <option key={profile.id} value={profile.id}>
                                        {profile.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-col gap-2">
                            <label className="text-sm text-secondary">Select Saved Application (Optional)</label>
                            <select
                                className="input"
                                value={selectedApplication}
                                onChange={(e) => {
                                    const appId = e.target.value;
                                    setSelectedApplication(appId);

                                    if (appId) {
                                        const app = applications.find(a => a.id === appId);
                                        if (app) {
                                            setJobDescriptionText(app.jobDescription || '');
                                            setCompanyName(app.company || '');
                                        }
                                    } else {
                                        setJobDescriptionText('');
                                        setCompanyName('');
                                    }
                                }}
                            >
                                <option value="">-- Or paste job description manually --</option>
                                {applications
                                    .filter(app => {
                                        // Show only applications without cover letter
                                        const hasCoverLetter = aiOutputs.some(
                                            output => output.applicationId === app.id && output.type === 'coverLetter'
                                        );
                                        return !hasCoverLetter;
                                    })
                                    .map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.company} - {app.position}
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
                            disabled={loading || !jobDescriptionText.trim() || !selectedProfile}
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
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
                                <h3 className="text-xl">Generated Cover Letter</h3>
                                <div className="flex gap-2">
                                    <div className="flex" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
                                        <button
                                            className={`btn ${!chatMode ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ padding: '4px 12px', fontSize: '14px' }}
                                            onClick={handleToggleChatMode}
                                        >
                                            📝 Generate
                                        </button>
                                        <button
                                            className={`btn ${chatMode ? 'btn-primary' : 'btn-ghost'}`}
                                            style={{ padding: '4px 12px', fontSize: '14px' }}
                                            onClick={handleToggleChatMode}
                                        >
                                            💬 Chat
                                        </button>
                                    </div>
                                    <button
                                        className="btn btn-outline"
                                        style={{ padding: '4px 8px' }}
                                        onClick={() => copyToClipboard(result)}
                                    >
                                        Copy
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        style={{ padding: '4px 8px' }}
                                        onClick={handleSaveCoverLetter}
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>

                            {!chatMode ? (
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                    {result}
                                </div>
                            ) : (
                                <div className="flex-col gap-3">
                                    {/* Conversation History */}
                                    <div className="flex-col gap-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {/* Initial result */}
                                        <div className="card" style={{ padding: 'var(--space-3)', backgroundColor: 'rgba(139, 92, 246, 0.1)' }}>
                                            <div className="text-sm text-secondary" style={{ marginBottom: 'var(--space-1)' }}>AI Assistant:</div>
                                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{result}</div>
                                        </div>

                                        {/* Chat messages */}
                                        {conversationHistory.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className="card"
                                                style={{
                                                    padding: 'var(--space-3)',
                                                    backgroundColor: msg.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                    marginLeft: msg.role === 'user' ? 'var(--space-8)' : '0',
                                                    marginRight: msg.role === 'assistant' ? 'var(--space-8)' : '0'
                                                }}
                                            >
                                                <div className="text-sm text-secondary" style={{ marginBottom: 'var(--space-1)' }}>
                                                    {msg.role === 'user' ? 'You:' : 'AI Assistant:'}
                                                </div>
                                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{msg.content}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Chat Input */}
                                    <div className="flex gap-2">
                                        <input
                                            className="input"
                                            placeholder="Ask AI to refine the cover letter..."
                                            value={chatInput}
                                            onChange={(e) => setChatInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleSendChat}
                                            disabled={loading || !chatInput.trim()}
                                        >
                                            {loading ? 'Sending...' : 'Send'}
                                        </button>
                                    </div>
                                </div>
                            )}
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
                            <label className="text-sm text-secondary">Select Saved Application (Optional)</label>
                            <select
                                className="input"
                                value={selectedApplication}
                                onChange={(e) => {
                                    const appId = e.target.value;
                                    setSelectedApplication(appId);

                                    if (appId) {
                                        const app = applications.find(a => a.id === appId);
                                        if (app) {
                                            setJobDescriptionText(app.jobDescription || '');
                                        }
                                    } else {
                                        setJobDescriptionText('');
                                    }
                                }}
                            >
                                <option value="">-- Or paste job description manually --</option>
                                {applications.map((app) => (
                                    <option key={app.id} value={app.id}>
                                        {app.company} - {app.position}
                                    </option>
                                ))}
                            </select>
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
                                <button
                                    className="btn btn-primary"
                                    style={{ padding: '4px 8px' }}
                                    onClick={() => handleSaveToApplication('cvOptimization')}
                                >
                                    💾 Save to Application
                                </button>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                                {result}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Save to Application Modal */}
            {showSaveModal && (
                <div style={{
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
                }}>
                    <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
                        <h3 className="text-xl" style={{ marginBottom: 'var(--space-4)' }}>
                            Save AI Output to Application
                        </h3>

                        <div className="flex-col gap-4">
                            <div className="flex-col gap-2">
                                <label className="text-sm text-secondary">Select Application</label>
                                <select
                                    className="input"
                                    value={selectedApplication}
                                    onChange={(e) => setSelectedApplication(e.target.value)}
                                >
                                    <option value="">-- Select an Application --</option>
                                    {applications.map((app) => (
                                        <option key={app.id} value={app.id}>
                                            {app.company} - {app.position}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    className="btn btn-outline"
                                    onClick={() => {
                                        setShowSaveModal(false);
                                        setSelectedApplication('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleConfirmSave}
                                    disabled={!selectedApplication}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
