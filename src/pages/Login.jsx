import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const { googleSignIn } = useAuth();
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleGoogleSignIn() {
        try {
            setError("");
            await googleSignIn();
            navigate("/");
        } catch (err) {
            setError("Failed to sign in: " + err.message);
            console.error(err);
        }
    }

    return (
        <div className="login-container" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: '#f0f2f5'
        }}>
            <div style={{
                padding: '2rem',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                textAlign: 'center',
                maxWidth: '400px',
                width: '100%'
            }}>
                <h2 style={{ marginBottom: '1.5rem', color: '#1a73e8' }}>Job Application Manager</h2>
                <p style={{ marginBottom: '2rem', color: '#5f6368' }}>Sign in to manage your job search</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                <button
                    onClick={handleGoogleSignIn}
                    style={{
                        padding: '10px 20px',
                        fontSize: '16px',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '100%',
                        gap: '10px'
                    }}
                >
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}
