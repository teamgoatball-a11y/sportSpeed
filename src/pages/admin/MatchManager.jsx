import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const MatchManager = () => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const navigate = useNavigate();

    const fetchMatches = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const fetchedMatches = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMatches(fetchedMatches);
        } catch (error) {
            console.error("Error fetching matches: ", error);
            toast.error("Failed to load matches");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    const handleDelete = async (matchId) => {
        if (window.confirm("Are you sure you want to delete this match? This action cannot be undone.")) {
            try {
                await deleteDoc(doc(db, 'matches', matchId));
                toast.success("Match deleted successfully");
                setSelectedIds(prev => {
                    const next = new Set(prev);
                    next.delete(matchId);
                    return next;
                });
                fetchMatches(); // Refresh list
            } catch (error) {
                console.error("Error deleting match: ", error);
                toast.error("Failed to delete match");
            }
        }
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === matches.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(matches.map(m => m.id)));
        }
    };

    const toggleSelectMatch = (id) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        
        if (window.confirm(`Are you sure you want to delete ${selectedIds.size} matches?`)) {
            setIsBulkDeleting(true);
            let successCount = 0;
            let failCount = 0;

            try {
                const idsArray = Array.from(selectedIds);
                for (const id of idsArray) {
                    try {
                        await deleteDoc(doc(db, 'matches', id));
                        successCount++;
                    } catch (e) {
                        console.error(`Error deleting match ${id}:`, e);
                        failCount++;
                    }
                }

                if (successCount > 0) {
                    toast.success(`Successfully deleted ${successCount} matches`);
                    fetchMatches();
                }
                if (failCount > 0) {
                    toast.error(`Failed to delete ${failCount} matches`);
                }
                setSelectedIds(new Set());
            } finally {
                setIsBulkDeleting(false);
            }
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Match Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage all live streams and schedules</p>
                </div>
                <div className="flex gap-3">
                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-500/20 rounded-xl font-medium transition-colors border border-orange-200 dark:border-orange-500/30"
                        >
                            <Trash2 size={20} />
                            {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size} Selected`}
                        </button>
                    )}
                    <button
                        onClick={fetchMatches}
                        className="p-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link
                        to="/admin/matches/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-sm shadow-red-600/20"
                    >
                        <Plus size={20} />
                        Add New Match
                    </Link>
                </div>
            </div>

            {/* Matches List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">

                {loading ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p>Loading matches...</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🏟️</span>
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Matches Found</p>
                        <p className="text-sm">Click 'Add New Match' to get started.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4 w-10">
                                        <input
                                            type="checkbox"
                                            checked={matches.length > 0 && selectedIds.size === matches.length}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                        />
                                    </th>
                                    <th className="px-6 py-4">Teams</th>
                                    <th className="px-6 py-4">League</th>
                                    <th className="px-6 py-4">Status & Time</th>
                                    <th className="px-6 py-4">Servers</th>
                                    <th className="px-6 py-4">Views</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                {matches.map((match) => (
                                    <tr key={match.id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group ${selectedIds.has(match.id) ? 'bg-red-50/30 dark:bg-red-500/5' : ''}`}>
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.has(match.id)}
                                                onChange={() => toggleSelectMatch(match.id)}
                                                className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{match.team1}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 italic">vs</p>
                                                    <p className="font-bold text-gray-900 dark:text-white text-base">{match.team2}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                {match.league}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                {match.status === "LIVE" ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 border border-red-200 dark:border-red-500/20 w-fit">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                                        LIVE
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 w-fit">
                                                        UPCOMING
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-600 dark:text-gray-400">{match.time}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                                {match.servers?.length || 0} Links
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span className="text-sm font-semibold">{match.views || 0}</span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <Link
                                                    to={`/admin/matches/edit/${match.id}`}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                                                    title="Edit Match"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(match.id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                                    title="Delete Match"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>
        </div>
    );
};

export default MatchManager;
