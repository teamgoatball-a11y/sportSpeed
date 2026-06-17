import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import siteSettings from '../config/siteSettings';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            const brand = siteSettings.brand || 'goatball';
            const docRef = doc(db, 'settings', brand);
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setSettings(docSnap.data());
                } else {
                    setSettings({});
                }
            } catch (error) {
                console.error(`Error fetching settings for brand ${brand}:`, error);
                setSettings({});
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    return React.createElement(
        SettingsContext.Provider,
        { value: { settings, loading } },
        children
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context || { settings: null, loading: true };
}
