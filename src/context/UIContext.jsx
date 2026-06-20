import React, { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) {
        throw new Error('useUI must be used within a UIProvider');
    }
    return context;
};

export const UIProvider = ({ children }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check local storage or default to dark mode
        const saved = localStorage.getItem('darkMode');
        if (saved !== null) return JSON.parse(saved);
        return true; // Default to dark mode
    });
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const toggleTheme = () => {
        setIsDarkMode(prev => !prev);
    };

    useEffect(() => {
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
            setIsAppInstalled(!!isStandalone);
        };
        checkInstalled();
        const mediaQuery = window.matchMedia('(display-mode: standalone)');
        if (mediaQuery.addEventListener) {
            mediaQuery.addEventListener('change', checkInstalled);
        }
        return () => {
            if (mediaQuery.removeEventListener) {
                mediaQuery.removeEventListener('change', checkInstalled);
            }
        };
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const value = {
        searchQuery,
        setSearchQuery,
        isDarkMode,
        toggleTheme,
        isAppInstalled,
        deferredPrompt,
        setDeferredPrompt
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};
