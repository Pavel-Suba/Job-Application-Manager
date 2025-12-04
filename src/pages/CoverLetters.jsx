import React, { useState } from 'react';
import { useFirestore } from '../hooks/useFirestore';
import { useGemini } from '../hooks/useGemini';

export const CoverLetters = () => {
    const { docs: coverLetters, deleteDocument, updateDocument, loading, error } = useFirestore('coverLetters');
    const { docs: applications } = useFirestore('applications');
    const { addDocument: addAIOutput } = useFirestore('aiOutputs');
    const { loading: aiLoading, chatWithAI, conversationHistory, resetConversation } = useGemini();

    const [selectedLetter, setSelectedLetter] = useState(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState('');
    const [showEditModal, setShowEditModal] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [editedContent, setEditedContent] = useState('');

    // Suggested prompts for editing
    const suggestedPrompts = [
        "Make it more formal",
        "Make it more casual and friendly",
        "Add more emphasis on my leadership skills",
        "Highlight my technical expertise",
        "Shorten it to 250 words",
        "Expand it to 400 words",
        "Make the tone more enthusiastic",
        "Make it more professional",
        "Focus more on my achievements",
        "Add a stronger closing paragraph"
    ];

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this cover letter?')) {
            await deleteDocument(id);
            if (selectedLetter?.id === id) {
                setSelectedLetter(null);
            }
        }
    };

    const handleLinkToApplication = () => {
        setShowLinkModal(true);
    };

    const handleConfirmLink = async () => {
        if (!selectedApplication || !selectedLetter) return;

        await addAIOutput({
            applicationId: selectedApplication,
            type: 'coverLetter',
            content: selectedLetter.content,
            originalPrompt: selectedLetter.jobDescription || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        setShowLinkModal(false);
        setSelectedApplication('');
        alert('Cover letter linked to application!');
    };

    const handleEditWithAI = () => {
        setEditedContent(selectedLetter.content);
        setShowEditModal(true);
        resetConversation();
    };

    const handleSendPrompt = async () => {
        if (!chatInput.trim()) return;
        const response = await chatWithAI(chatInput, editedContent);
        setEditedContent(response);
        setChatInput('');
    };

    const handleSaveEdited = async () => {
        await updateDocument(selectedLetter.id, {
            content: editedContent,
            updatedAt: new Date().toISOString()
        });
        setSelectedLetter({ ...selectedLetter, content: editedContent });
        setShowEditModal(false);
        resetConversation();
        alert('Cover letter updated!');
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (loading) {
        return <div>Loading cover letters...</div>;
    }

    if (error) {
        return <div style={{ color: 'red' }}>Error loading cover letters: {error}</div>;
    }

    return (
        <div className="flex-col gap-4">
            <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-6)' }}>
                <h2 className="text-2xl">Cover Letters</h2>
                <a href="/ai-assistant" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                    + Generate New
                </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 'var(--space-4)', height: 'calc(100vh - 150px)' }}>
                {/* Sidebar List */}
                <div className="card flex-col gap-2" style={{ overflowY: 'auto', padding: 'var(--space-2)' }}>
                    {coverLetters.length === 0 ? (
                        <p className="text-secondary" style={{ padding: 'var(--space-4)' }}>No cover letters saved yet.</p>
                    ) : (
                        coverLetters.map((letter) => (
                            <div
                                key={letter.id}
                                className="card"
                                style={{
                                    padding: 'var(--space-3)',
                                    cursor: 'pointer',
                                    border: selectedLetter?.id === letter.id ? '1px solid var(--primary)' : '1px solid var(--border)',
                                    backgroundColor: selectedLetter?.id === letter.id ? 'rgba(255,255,255,0.05)' : 'transparent'
                                }}
                                onClick={() => setSelectedLetter(letter)}
                            >
                                <h4 style={{ fontWeight: 500, marginBottom: '4px' }}>{letter.company || 'Untitled'}</h4>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-secondary">{letter.date}</span>
                                    <button
                                        className="btn btn-ghost"
                                        style={{ padding: '2px 6px', fontSize: '12px', color: 'var(--danger)' }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(letter.id);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Preview Area */}
                <div className="card flex-col gap-4" style={{ overflowY: 'auto' }}>
                    {selectedLetter ? (
                        <>
                            <div className="flex justify-between items-center" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-4)' }}>
                                <div>
                                    <h3 className="text-xl">{selectedLetter.company}</h3>
                                    <p className="text-sm text-secondary">{selectedLetter.position}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-outline"
                                        onClick={() => copyToClipboard(selectedLetter.content)}
                                    >
                                        📋 Copy Text
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleEditWithAI}
                                    >
                                        ✨ Edit with AI
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleLinkToApplication}
                                    >
                                        🔗 Link to Application
                                    </button>
                                </div>
                            </div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6', fontFamily: 'serif', fontSize: '1.1rem' }}>
                                {selectedLetter.content}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center" style={{ height: '100%', color: 'var(--text-secondary)' }}>
                            Select a cover letter to view
                        </div>
                    )}
                </div>
            </div>

            {/* Link to Application Modal */}
            {showLinkModal && (
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
                            Link Cover Letter to Application
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
                                        setShowLinkModal(false);
                                        setSelectedApplication('');
                                    }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-primary"
                                    onClick={handleConfirmLink}
                                    disabled={!selectedApplication}
                                >
                                    Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Edit Modal */}
            {showEditModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: 'var(--space-4)'
                }}>
                    <div className="card" style={{ maxWidth: '1000px', width: '95%', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)', paddingBottom: 'var(--space-3)' }}>
                            <h3 className="text-xl">✨ Edit Cover Letter with AI</h3>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetConversation();
                                }}
                                style={{ padding: '4px 8px' }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-4)', flex: 1, overflow: 'hidden' }}>
                            {/* Left: Preview */}
                            <div className="flex-col gap-3" style={{ overflow: 'hidden' }}>
                                <div className="text-sm text-secondary">Current Version:</div>
                                <div
                                    className="card"
                                    style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        padding: 'var(--space-4)',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        whiteSpace: 'pre-wrap',
                                        lineHeight: '1.6',
                                        fontFamily: 'serif'
                                    }}
                                >
                                    {editedContent}
                                </div>

                                {/* Chat History */}
                                {conversationHistory.length > 0 && (
                                    <div className="flex-col gap-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        <div className="text-sm text-secondary">Conversation:</div>
                                        {conversationHistory.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className="text-sm"
                                                style={{
                                                    padding: 'var(--space-2)',
                                                    backgroundColor: msg.role === 'user' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(139, 92, 246, 0.1)',
                                                    borderRadius: 'var(--radius-md)',
                                                    marginLeft: msg.role === 'user' ? 'var(--space-4)' : '0',
                                                    marginRight: msg.role === 'assistant' ? 'var(--space-4)' : '0'
                                                }}
                                            >
                                                <strong>{msg.role === 'user' ? 'You:' : 'AI:'}</strong> {msg.content}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Right: Suggested Prompts */}
                            <div className="flex-col gap-3" style={{ overflowY: 'auto' }}>
                                <div className="text-sm text-secondary">Suggested Edits:</div>
                                <div className="flex-col gap-2">
                                    {suggestedPrompts.map((prompt, idx) => (
                                        <button
                                            key={idx}
                                            className="btn btn-outline"
                                            onClick={() => setChatInput(prompt)}
                                            style={{
                                                textAlign: 'left',
                                                padding: 'var(--space-2) var(--space-3)',
                                                fontSize: '0.85rem',
                                                whiteSpace: 'normal',
                                                height: 'auto'
                                            }}
                                        >
                                            {prompt}
                                        </button>
                                    ))}
                                </div>

                                <div className="text-sm text-secondary" style={{ marginTop: 'var(--space-3)' }}>Custom Prompt:</div>
                                <div className="flex-col gap-2">
                                    <textarea
                                        className="input"
                                        rows={3}
                                        placeholder="Enter your custom editing instruction..."
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                    />
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleSendPrompt}
                                        disabled={aiLoading || !chatInput.trim()}
                                    >
                                        {aiLoading ? 'Processing...' : 'Send'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2" style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border)' }}>
                            <button
                                className="btn btn-outline"
                                onClick={() => {
                                    setShowEditModal(false);
                                    resetConversation();
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSaveEdited}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
