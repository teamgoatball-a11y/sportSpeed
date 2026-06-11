import React, { useState, useEffect } from 'react';
import { doc, setDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { X, Download } from 'lucide-react';

function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed in this session
        if (sessionStorage.getItem('pwa_prompt_dismissed')) {
            setIsDismissed(true);
        }

        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setIsVisible(true);
        };

        const handleAppInstalled = async () => {
            // Hide the app-provided install promotion
            setIsVisible(false);
            // Clear the deferredPrompt so it can be garbage collected
            setDeferredPrompt(null);
            
            // Track the install in Firestore
            try {
                const statsRef = doc(db, 'stats', 'pwa');
                await setDoc(statsRef, {
                    totalInstalls: increment(1),
                    lastInstallAt: new Date().toISOString()
                }, { merge: true });
                console.log('PWA Install tracked successfully');
            } catch (err) {
                console.error('Error tracking PWA install:', err);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        // Show the install prompt
        deferredPrompt.prompt();
        
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        
        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setIsDismissed(true);
        sessionStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    // If dismissed or not ready to show, don't render anything
    if (!isVisible || isDismissed) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 bg-white dark:bg-gray-900 border-2 border-black rounded-2xl shadow-2xl p-4 z-50 animate-fade-in flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=GB&background=dc2626&color=fff'} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Install GOATBALL</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Stream faster & get quick access</p>
                </div>
            </div>
            
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleInstallClick}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors"
                >
                    <Download size={14} /> Install
                </button>
                <button 
                    onClick={handleDismiss}
                    className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}

export default InstallPrompt;
