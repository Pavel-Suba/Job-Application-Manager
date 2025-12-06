import React, { createContext, useContext, useState, useEffect } from "react";
import {
    signInWithPopup,
    GoogleAuthProvider,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../firebase";

const AuthContext = createContext();

// Whitelist povolených emailů
const ALLOWED_EMAILS = [
    'pavel@cecinafrica.com',
    'pav.suba@gmail.com'
];

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    // Kontrola, zda je email na whitelistu
    function isEmailAllowed(email) {
        return ALLOWED_EMAILS.includes(email?.toLowerCase());
    }

    function googleSignIn() {
        const provider = new GoogleAuthProvider();
        setAuthError(null);
        return signInWithPopup(auth, provider);
    }

    function logout() {
        setAuthError(null);
        return signOut(auth);
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Kontrola whitelistu
                if (!isEmailAllowed(user.email)) {
                    setAuthError(`Přístup odepřen. Email "${user.email}" není autorizován.`);
                    await signOut(auth);
                    setCurrentUser(null);
                } else {
                    setCurrentUser(user);
                    setAuthError(null);
                }
            } else {
                setCurrentUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        googleSignIn,
        logout,
        authError,
        isEmailAllowed
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
