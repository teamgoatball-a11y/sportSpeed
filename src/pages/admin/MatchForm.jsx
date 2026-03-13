import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { collection, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ArrowLeft, Save, Plus, Trash2, Link as LinkIcon, Search, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSportsApi } from '../../hooks/useSportsApi';

const INITIAL_STATE = {
    team1: '',
    team2: '',
    team1Logo: '',
    team2Logo: '',
    league: '',
    category: 'Football',
    time: '',
    date: '',
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

    // Bulk Import State
    const [selectedApiMatches, setSelectedApiMatches] = useState([]);
    const [bulkImporting, setBulkImporting] = useState(false);

    // API Auto-fill State
    const { fetchTodaysMatches, fetchTomorrowsMatches, searchMatchByLeagueAndDate, loading: apiLoading } = useSportsApi();
    const [apiMatches, setApiMatches] = useState([]);
    const [showApiModal, setShowApiModal] = useState(false);
    const [searchMode, setSearchMode] = useState('today'); // 'today' or 'advanced'
    const [searchLeague, setSearchLeague] = useState('');
    const [searchDate, setSearchDate] = useState('');

    const handleFetchTodaysApi = async () => {
        try {
            const matches = await fetchTodaysMatches();
            setApiMatches(matches);
            setSelectedApiMatches([]); // Clear selection on new search
            if (matches.length === 0) toast.error("No matches found for today.");
        } catch (e) {
            toast.error("Failed to fetch matches");
        }
    };

    const handleFetchTomorrowsApi = async () => {
        try {
            const matches = await fetchTomorrowsMatches();
            setApiMatches(matches);
            setSelectedApiMatches([]); // Clear selection on new search
            if (matches.length === 0) toast.error("No matches found for tomorrow.");
        } catch (e) {
            toast.error("Failed to fetch matches");
        }
    };

    const handleAdvancedSearch = async (e) => {
        e.preventDefault();
        if (!searchLeague || !searchDate) return;
        try {
            const matches = await searchMatchByLeagueAndDate(searchLeague, searchDate);
            setApiMatches(matches);
            setSelectedApiMatches([]); // Clear selection on new search
            if (matches.length === 0) toast.error("No matches found for that league on that date.");
        } catch (err) {
            toast.error("Failed to search matches");
        }
    };

    const handleSelectApiMatch = (match) => {
        // If we are in bulk mode (adding new), we toggle selection instead of auto-fill
        if (!isEditing) {
            toggleApiMatchSelection(match);
            return;
        }

        setFormData(prev => ({
            ...prev,
            team1: match.team1,
            team2: match.team2,
            team1Logo: match.team1Logo || '',
            team2Logo: match.team2Logo || '',
            league: match.league,
            time: match.time,
            date: match.date || '',  // ← save match date so Home.jsx can use it
            category: match.category,
        }));
        setShowApiModal(false);
        toast.success(`Auto-filled details for ${match.team1} vs ${match.team2}`);
    };

    const toggleApiMatchSelection = (match) => {
        setSelectedApiMatches(prev => {
            const isSelected = prev.some(m => m.id === match.id);
            if (isSelected) {
                return prev.filter(m => m.id !== match.id);
            } else {
                return [...prev, match];
            }
        });
    };

    const handleBulkImport = async () => {
        if (selectedApiMatches.length === 0) return;
        setBulkImporting(true);
        let successCount = 0;
        let failCount = 0;

        try {
            for (const match of selectedApiMatches) {
                const matchData = {
                    ...INITIAL_STATE,
                    team1: match.team1,
                    team2: match.team2,
                    team1Logo: match.team1Logo || '',
                    team2Logo: match.team2Logo || '',
                    league: match.league,
                    time: match.time,
                    date: match.date || '',
                    category: match.category,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                };

                try {
                    await addDoc(collection(db, 'matches'), matchData);
                    successCount++;
                } catch (e) {
                    console.error("Error importing match:", e);
                    failCount++;
                }
            }

            if (successCount > 0) {
                toast.success(`Successfully imported ${successCount} matches!`);
                navigate('/admin/dashboard');
            }
            if (failCount > 0) {
                toast.error(`Failed to import ${failCount} matches.`);
            }
        } finally {
            setBulkImporting(false);
            setShowApiModal(false);
        }
    };

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
        <>
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
                        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Match Details</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Basic information about the event</p>
                            </div>

                            {/* Auto-fill from API Button */}
                            <div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowApiModal(true);
                                        if (apiMatches.length === 0 && searchMode === 'today') {
                                            handleFetchTodaysApi();
                                        }
                                    }}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 rounded-xl font-medium text-sm transition-colors border border-indigo-200 dark:border-indigo-500/30"
                                >
                                    <Search size={16} />
                                    Search Live API
                                </button>
                            </div>
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
                                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Match Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-gray-900 dark:text-white"
                                />
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
                                    placeholder="e.g. 8:00 PM"
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

            {/* Full-Screen Advanced API Search Modal */}
            {
                showApiModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white dark:bg-gray-800 w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700">
                            {/* Modal Header */}
                            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <Search size={18} className="text-indigo-500" />
                                        API Match Selection
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {isEditing ? 'Selection fills the form below.' : 'Select multiple matches to import in bulk.'}
                                    </p>
                                </div>
                                <button type="button" onClick={() => setShowApiModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2">✕</button>
                            </div>

                            {/* Search Toolbar */}
                            <div className="p-5 border-b border-gray-100 dark:border-gray-700/50 bg-white dark:bg-gray-800 space-y-4">
                                <div className="flex gap-2 flex-wrap">
                                    <button
                                        onClick={() => {
                                            setSearchMode('today');
                                            handleFetchTodaysApi();
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${searchMode === 'today' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        Today's Matches
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSearchMode('tomorrow');
                                            handleFetchTomorrowsApi();
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${searchMode === 'tomorrow' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        Tomorrow's Matches
                                    </button>
                                    <button
                                        onClick={() => {
                                            setSearchMode('advanced');
                                            setApiMatches([]);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${searchMode === 'advanced' ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                    >
                                        Advanced Search (League + Date)
                                    </button>
                                </div>

                                {searchMode === 'advanced' && (
                                    <form onSubmit={handleAdvancedSearch} className="flex flex-col sm:flex-row gap-3">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                list="league-options"
                                                placeholder="Type to search OR pick from dropdown..."
                                                value={searchLeague}
                                                onChange={(e) => setSearchLeague(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                                                required
                                            />
                                            <datalist id="league-options">
                                                <option value="World Cup" />
                                                <option value="Euro Championship" />
                                                <option value="Friendlies" />
                                                <option value="UEFA Champions League" />
                                                <option value="UEFA Europa League" />
                                                <option value="Premier League" />
                                                <option value="La Liga" />
                                                <option value="Serie A" />
                                                <option value="Bundesliga" />
                                                <option value="Ligue 1" />
                                                <option value="Primeira Liga" />
                                                <option value="Eredivisie" />
                                                <option value="Süper Lig" />
                                                <option value="Copa Libertadores" />
                                                <option value="Major League Soccer" />
                                                <option value="CONCACAF Champions Cup" />
                                                <option value="Brasileiro Série A" />
                                                <option value="Liga Profesional Argentina" />
                                                <option value="Indian Super League" />
                                                <option value="Africa Cup of Nations" />
                                                <option value="Saudi Pro League" />
                                            </datalist>
                                        </div>
                                        <div className="sm:w-48">
                                            <input
                                                type="date"
                                                value={searchDate}
                                                onChange={(e) => setSearchDate(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                                                required
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={apiLoading}
                                            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 min-w-[120px]"
                                        >
                                            {apiLoading ? <Loader2 size={16} className="animate-spin" /> : 'Search'}
                                        </button>
                                    </form>
                                )}
                            </div>

                            {/* Results List */}
                            <div className="flex-1 overflow-y-auto min-h-[300px] p-2 bg-gray-50 dark:bg-gray-900/50">
                                {apiLoading && <div className="h-full flex items-center justify-center text-gray-400"><Loader2 className="animate-spin w-8 h-8" /></div>}

                                {!apiLoading && apiMatches.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-400 pb-10 mt-10">
                                        <Search size={40} className="mb-4 text-gray-300 dark:text-gray-600" />
                                        <p>No matches to display.</p>
                                        <p className="text-sm mt-1">Try adjusting your search criteria.</p>
                                    </div>
                                )}

                                {!apiLoading && apiMatches.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3">
                                        {apiMatches.map(m => {
                                            const isSelected = selectedApiMatches.some(sel => sel.id === m.id);
                                            return (
                                                <button
                                                    key={m.id}
                                                    type="button"
                                                    onClick={() => handleSelectApiMatch(m)}
                                                    className={`text-left p-4 bg-white dark:bg-gray-800 border rounded-xl hover:shadow-md transition-all flex flex-col gap-2 group relative ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                                                >
                                                    {!isEditing && (
                                                        <div className={`absolute top-3 right-3 w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600'}`}>
                                                            {isSelected && <Save size={12} />}
                                                        </div>
                                                    )}
                                                    <div className="flex justify-between items-start w-full pr-8">
                                                        <span className={`text-xs font-bold uppercase tracking-wide group-hover:text-indigo-500 transition-colors ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400'}`}>
                                                            {m.league}
                                                        </span>
                                                        <span className="text-xs font-semibold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md dark:text-gray-300">
                                                            {m.time}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white leading-tight">
                                                        {m.team1} <span className="text-gray-400 font-normal mx-1">vs</span> {m.team2}
                                                    </div>
                                                    {m.date && <div className="text-[10px] text-gray-500 dark:text-gray-500 font-medium">{m.date}</div>}
                                                </button>
                                            )
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer (Bulk Action) */}
                            {!isEditing && apiMatches.length > 0 && (
                                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between">
                                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        <span className="text-indigo-600 dark:text-indigo-400 font-bold">{selectedApiMatches.length}</span> matches selected
                                    </div>
                                    <button
                                        type="button"
                                        disabled={selectedApiMatches.length === 0 || bulkImporting}
                                        onClick={handleBulkImport}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-bold text-sm transition-all shadow-md ${selectedApiMatches.length === 0 || bulkImporting
                                            ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                            : 'bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-600/30 hover:-translate-y-0.5'
                                            }`}
                                    >
                                        {bulkImporting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                                        {bulkImporting ? 'Importing...' : `Import ${selectedApiMatches.length} Matches`}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )
            }
        </>
    );
};

export default MatchForm;
