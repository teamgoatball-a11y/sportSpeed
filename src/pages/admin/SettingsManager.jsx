import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';
import { Download, Smartphone } from 'lucide-react';
import siteSettings from '../../config/siteSettings';

function SettingsManager() {
    const [whatsappLink, setWhatsappLink] = useState('');
    const [channelLink, setChannelLink] = useState('');
    const [pwaStats, setPwaStats] = useState({ totalInstalls: 0, standaloneOpens: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const brand = siteSettings.brand || 'goatball';
                const docRef = doc(db, 'settings', brand);
                let docSnap = await getDoc(docRef);
                
                // Fallback to settings/general if brand-specific settings don't exist yet
                if (!docSnap.exists()) {
                    const generalRef = doc(db, 'settings', 'general');
                    docSnap = await getDoc(generalRef);
                }

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.whatsappLink) {
                        setWhatsappLink(data.whatsappLink);
                    }
                    if (data.channelLink) {
                        setChannelLink(data.channelLink);
                    }
                }

                const statsRef = doc(db, 'stats', 'pwa');
                const statsSnap = await getDoc(statsRef);
                if (statsSnap.exists()) {
                    const stats = statsSnap.data();
                    setPwaStats({
                        totalInstalls: stats.totalInstalls || 0,
                        standaloneOpens: stats.standaloneOpens || 0
                    });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                toast.error("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const brand = siteSettings.brand || 'goatball';
            const docRef = doc(db, 'settings', brand);
            await setDoc(docRef, { whatsappLink, channelLink }, { merge: true });
            toast.success("Settings saved successfully!");
        } catch (error) {
            console.error("Error saving settings:", error);
            toast.error("Failed to save settings.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">Global Settings</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global configurations and view app statistics.</p>
                </div>
            </div>

            {/* App Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black shadow-sm p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600">
                        <Download size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Total App Installs</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{pwaStats.totalInstalls}</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black shadow-sm p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-500">
                        <Smartphone size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Active App Opens</p>
                        <p className="text-3xl font-black text-gray-900 dark:text-white">{pwaStats.standaloneOpens}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black shadow-sm overflow-hidden p-6 sm:p-8 transition-colors duration-300">
                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                            WhatsApp Group Link
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Set the WhatsApp group link that will appear as a prompt on every match page. Leave blank to hide the prompt.
                        </p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                                </svg>
                            </div>
                            <input
                                type="url"
                                value={whatsappLink}
                                onChange={(e) => setWhatsappLink(e.target.value)}
                                className="pl-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="https://chat.whatsapp.com/..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                            WhatsApp Channel Link
                        </label>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Set the WhatsApp channel link that will appear as a "Join Channel" button on all video player pages. Leave blank to hide the button.
                        </p>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.7-2.48 2.75-2.7.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02-.11.02-1.78 1.13-5.03 3.33-.48.33-.91.49-1.3.48-.43-.01-1.26-.24-1.88-.45-.76-.25-1.37-.39-1.32-.82.03-.22.33-.45.92-.69 3.6-1.57 6-2.61 7.2-3.11 3.42-1.42 4.12-1.67 4.59-1.68.1 0 .33.02.48.15.12.1.16.23.17.33 0 .07.01.2.01.29z"/>
                                </svg>
                            </div>
                            <input
                                type="url"
                                value={channelLink}
                                onChange={(e) => setChannelLink(e.target.value)}
                                className="pl-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 outline-none"
                                placeholder="https://whatsapp.com/channel/..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                "Save Settings"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SettingsManager;
