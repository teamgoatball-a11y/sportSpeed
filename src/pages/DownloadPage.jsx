import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Download, Monitor, Smartphone, Share, PlusSquare, Apple } from 'lucide-react';
import { siteSettings } from '../config/siteSettings';
import { useUI } from '../context/UIContext';

function DownloadPage() {
    const { deferredPrompt, setDeferredPrompt } = useUI();

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            alert("Your browser doesn't support direct installation or the app is already installed. Please follow the manual instructions below.");
            return;
        }
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setDeferredPrompt(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 animate-fade-in">
            <Helmet>
                <title>Download App | {siteSettings.name}</title>
                <meta name="description" content={`Install the ${siteSettings.name} app on your phone or desktop for the best streaming experience.`} />
            </Helmet>

            <div className="text-center mb-16">
                <div className="w-28 h-28 bg-white dark:bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-red-500/20 border-4 border-gray-100 dark:border-gray-800 overflow-hidden">
                    <img src="/logo.png?v=4" alt="Logo" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=GB&background=dc2626&color=fff'} />
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 font-display italic">
                    Get The <span className="text-red-600">Official App</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                    Install {siteSettings.name.toUpperCase()} directly to your device for a faster, ad-free-like experience with instant access to live streams.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={handleInstallClick}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-black text-lg uppercase tracking-wider rounded-xl shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-1"
                    >
                        <Download size={24} /> 
                        {deferredPrompt ? 'Install App Now' : 'Check Install Availability'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {/* iOS Instructions */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-6 text-gray-100 dark:text-gray-800/50 group-hover:text-red-50 dark:group-hover:text-red-900/20 transition-colors pointer-events-none">
                        <Apple size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center mb-6">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">iPhone & iPad</h3>
                        <ol className="space-y-4 text-gray-600 dark:text-gray-400 font-medium list-decimal list-inside">
                            <li>Open this website in the <strong className="text-gray-900 dark:text-white">Safari</strong> browser.</li>
                            <li>Tap the <strong className="text-gray-900 dark:text-white">Share</strong> button <Share size={16} className="inline mb-1 mx-1" /> at the bottom of the screen.</li>
                            <li>Scroll down and tap <strong className="text-gray-900 dark:text-white">Add to Home Screen</strong> <PlusSquare size={16} className="inline mb-1 mx-1" />.</li>
                            <li>Tap <strong className="text-gray-900 dark:text-white">Add</strong> in the top right corner.</li>
                        </ol>
                    </div>
                </div>

                {/* Android / Desktop Instructions */}
                <div className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden group hover:border-red-500/50 transition-colors">
                    <div className="absolute top-0 right-0 p-6 text-gray-100 dark:text-gray-800/50 group-hover:text-red-50 dark:group-hover:text-red-900/20 transition-colors pointer-events-none">
                        <Monitor size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center mb-6">
                            <Smartphone size={24} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">Android & Desktop</h3>
                        <ol className="space-y-4 text-gray-600 dark:text-gray-400 font-medium list-decimal list-inside">
                            <li>Open this website in <strong className="text-gray-900 dark:text-white">Google Chrome</strong>.</li>
                            <li>Tap the <strong className="text-gray-900 dark:text-white">3 dots menu</strong> <span className="inline-block tracking-widest px-1 font-bold">⋮</span> in the top right corner.</li>
                            <li>Select <strong className="text-gray-900 dark:text-white">Install App</strong> or <strong className="text-gray-900 dark:text-white">Add to Home screen</strong>.</li>
                            <li>Follow the prompt to install the app.</li>
                        </ol>
                    </div>
                </div>
            </div>

            <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-6 border border-red-100 dark:border-red-500/20 text-center">
                <p className="text-red-800 dark:text-red-300 font-medium text-sm">
                    <strong>Why install?</strong> The app provides a faster streaming experience, full-screen mode, completely bypasses browser ad-blocker restrictions, and takes up less than 1MB of storage!
                </p>
            </div>
        </div>
    );
}

export default DownloadPage;
