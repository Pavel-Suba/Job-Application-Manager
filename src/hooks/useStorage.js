import { useState } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useAuth } from '../context/AuthContext';

export const useStorage = () => {
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(null);
    const { currentUser } = useAuth();

    const uploadFile = (file, folder = 'uploads') => {
        if (!currentUser) return;

        // Create a unique file name
        const filePath = `${folder}/${currentUser.uid}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, filePath);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const percentage = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(percentage);
            },
            (err) => {
                setError(err);
            },
            async () => {
                const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
                setUrl(downloadUrl);
            }
        );

        return uploadTask; // Return task to allow awaiting if needed (though promise handling is tricky with on())
    };

    return { progress, error, url, uploadFile, setUrl, setProgress };
};
