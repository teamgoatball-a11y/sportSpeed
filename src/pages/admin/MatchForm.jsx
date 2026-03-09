import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_STATE = {
    team1: '',
    team2: '',
    league: '',
    category: 'Football',
    time: '',
    status: 'UPCOMING',
    venue: '',
    views: 0,
    servers: [{ name: '', url: '' }]
};

const MatchForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [formData, setFormData] = useState(INITIAL_STATE);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            const fetchMatch = async () => {
                try {
                    const docRef = doc(db, 'matches', id);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        setFormData({
                            ...INITIAL_STATE, // ensure fields exist
                            ...data,
                            servers: data.servers && data.servers.length > 0 ? data.servers : [{ name: '', url: '' }]
                        });
                    } else {
                        toast.error("Match not found");
                        navigate('/admin/dashboard');
                    }
                } catch (error) {
                    console.error("Error fetching match:", error);
                    toast.error("Failed to load match details");
                } finally {
                    setFetching(false);
                }
            };
            fetchMatch();
        }
    }, [id, navigate, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleServerChange = (index, field, value) => {
        const newServers = [...formData.servers];
        newServers[index][field] = value;
        setFormData(prev => ({ ...prev, servers: newServers }));
    };

    const addServer = () => {
        setFormData(prev => ({
            ...prev,
            servers: [...prev.servers, { name: '', url: '' }]
        }));
    };

    const removeServer = (index) => {
        const newServers = formData.servers.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            servers: newServers.length > 0 ? newServers : [{ name: '', url: '' }]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Filter out empty servers
        const cleanServers = formData.servers.filter(s => s.name.trim() !== '' && s.url.trim() !== '');

        const matchData = {
            ...formData,
            servers: cleanServers,
            updatedAt: serverTimestamp()
        };

        try {
            if (isEditing) {
                await updateDoc(doc(db, 'matches', id), matchData);
                toast.success("Match updated successfully!");
            } else {
                matchData.createdAt = serverTimestamp();
                // Fallback for ID if needed by frontend before firestore generates one, though firestore auto gen id is best.
                // The old matches.js used integer IDs. Let's just use firestore strings.
                await addDoc(collection(db, 'matches'), matchData);
                toast.success("Match created successfully!");
            }
            navigate('/admin/dashboard');
        } catch (error) {
            console.error("Error saving match:", error);
            toast.error(error.message || `Failed to ${isEditing ? 'update' : 'create'} match`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="p-12 text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin/dashboard"
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                            {isEditing ? 'Edit Match' : 'Add New Match'}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Match Details Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Match Details</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basic information about the event</p>
                    </div>

                    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team 1 (Home)</label>
                            <input
                                type="text"
                                name="team1"
                                value={formData.team1}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Manchester United"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Team 2 (Away)</label>
                            <input
                                type="text"
                                name="team2"
                                value={formData.team2}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Arsenal"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">League / Tournament</label>
                            <input
                                type="text"
                                name="league"
                                value={formData.league}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Premier League"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Venue</label>
                            <input
                                type="text"
                                name="venue"
                                value={formData.venue}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Old Trafford"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                            >
                                <option value="Football">Football</option>
                                <option value="Cricket">Cricket</option>
                                <option value="Others">Others</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Start Time</label>
                            <input
                                type="text"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                placeholder="e.g. Today, 20:00 GMT"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                            >
                                <option value="UPCOMING">UPCOMING</option>
                                <option value="LIVE">LIVE NOW</option>
                                <option value="COMPLETED">COMPLETED</option>
                            </select>
                        </div>

                    </div>
                </div>

                {/* Server Links Section */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Streaming Servers</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Add M3U8, Embed, or direct links</p>
                        </div>
                        <button
                            type="button"
                            onClick={addServer}
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold transition-colors border border-gray-200 dark:border-gray-700"
                        >
                            <Plus size={16} />
                            Add Link
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        {formData.servers.map((server, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-800">

                                <div className="flex-1 w-full space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Server Name</label>
                                    <input
                                        type="text"
                                        value={server.name}
                                        onChange={(e) => handleServerChange(index, 'name', e.target.value)}
                                        placeholder="e.g. VIP Server HD"
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm text-gray-900 dark:text-white"
                                    />
                                </div>

                                <div className="flex-[2] w-full space-y-1">
                                    <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Stream URL</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                            <LinkIcon size={14} />
                                        </div>
                                        <input
                                            type="url"
                                            value={server.url}
                                            onChange={(e) => handleServerChange(index, 'url', e.target.value)}
                                            placeholder="https://example.com/stream.m3u8"
                                            className="w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none text-sm text-gray-900 dark:text-white"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => removeServer(index)}
                                    className="mt-5 sm:mt-0 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                    title="Remove Server"
                                >
                                    <Trash2 size={18} />
                                </button>

                            </div>
                        ))}
                    </div>
                </div>

                {/* Submit Area */}
                <div className="flex justify-end pt-4 pb-12">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-bold text-lg transition-all shadow-lg ${loading
                            ? 'bg-red-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 hover:shadow-red-600/30 hover:-translate-y-0.5 transform'
                            }`}
                    >
                        <Save size={20} />
                        {loading ? 'Saving...' : (isEditing ? 'Update Match' : 'Publish Match')}
                    </button>
                </div>

            </form>

        </div>
    );
};

export default MatchForm;
