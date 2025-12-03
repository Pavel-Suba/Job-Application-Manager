
import { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    query,
    where,
    onSnapshot,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const useFirestore = (collectionName) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        if (!currentUser) {
            setDocs([]);
            setLoading(false);
            return;
        }

        // Note: Removed orderBy('createdAt', 'desc') to avoid needing a composite index immediately.
        // We will sort client-side for now.
        const q = query(
            collection(db, collectionName),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                let documents = [];
                snapshot.forEach((doc) => {
                    documents.push({ ...doc.data(), id: doc.id });
                });
                // Client-side sort
                documents.sort((a, b) => {
                    const dateA = a.createdAt?.seconds || 0;
                    const dateB = b.createdAt?.seconds || 0;
                    return dateB - dateA;
                });
                setDocs(documents);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [collectionName, currentUser]);

    const addDocument = async (docData) => {
        try {
            await addDoc(collection(db, collectionName), {
                ...docData,
                userId: currentUser.uid,
                createdAt: serverTimestamp()
            });
        } catch (err) {
            console.error("Error adding document:", err);
            throw err;
        }
    };

    const deleteDocument = async (id) => {
        try {
            await deleteDoc(doc(db, collectionName, id));
        } catch (err) {
            console.error("Error deleting document:", err);
            throw err;
        }
    };

    return { docs, addDocument, deleteDocument, loading, error };
};
