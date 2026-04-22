import React, { useState, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import toast from 'react-hot-toast';

function SettingsManager() {
    const [whatsappLink, setWhatsappLink] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const docRef = doc(db, 'settings', 'general');
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (data.whatsappLink) {
                        setWhatsappLink(data.whatsappLink);
                    }
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
            const docRef = doc(db, 'settings', 'general');
            await setDoc(docRef, { whatsappLink }, { merge: true });
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
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Manage global configurations for the application.</p>
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
