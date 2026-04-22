import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export function useSettings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const docRef = doc(db, 'settings', 'general');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                setSettings(docSnap.data());
            } else {
                setSettings({});
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching settings:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { settings, loading };
}
