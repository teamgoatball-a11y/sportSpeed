import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Plus, Trash2, Video, Link as LinkIcon, Save, Loader2, ArrowLeft, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const getYouTubeID = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const createSlug = (title) => {
    return title.toLowerCase().replace(/[^a-z0-0]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
};

const HighlightsManager = () => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [type, setType] = useState('youtube'); // 'youtube' or 'embed'
    const [newHighlight, setNewHighlight] = useState({
        title: '',
        competition: '',
        content: '', // URL or Embed Code
        thumbnail: '', // Manual thumbnail for custom embeds
    });

    useEffect(() => {
        const q = query(collection(db, 'highlights'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHighlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        
        try {
            let docData = {
                title: newHighlight.title,
                competition: newHighlight.competition,
                type: type,
                slug: createSlug(newHighlight.title),
                createdAt: serverTimestamp(),
            };

            if (type === 'youtube') {
                const videoId = getYouTubeID(newHighlight.content);
                if (!videoId) {
                    toast.error("Invalid YouTube URL");
                    setSaving(false);
                    return;
                }
                docData.youtubeId = videoId;
                docData.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            } else {
                docData.embedHtml = newHighlight.content;
                docData.thumbnail = newHighlight.thumbnail || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800'; // Default soccer placeholder
            }

            await addDoc(collection(db, 'highlights'), docData);
            setNewHighlight({ title: '', competition: '', content: '', thumbnail: '' });
            toast.success("Highlight added!");
        } catch (error) {
            toast.error("Failed to add highlight");
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure?")) return;
        try {
            await deleteDoc(doc(db, 'highlights', id));
            toast.success("Deleted");
        } catch (error) {
            toast.error("Failed");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-black shadow-sm">
                <div className="flex items-center gap-4">
                    <Link to="/admin/dashboard" className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-xl transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Highlights Hub</h1>
                </div>
            </div>

            {/* Add Form */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-black shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold flex items-center gap-2 tracking-tight">
                        <Plus size={20} className="text-red-600" /> New Highlight
                    </h2>
                    
                    {/* Toggle */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setType('youtube')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'youtube' ? 'bg-white dark:bg-gray-900 shadow-sm text-red-600' : 'text-gray-500'}`}
                        >
                            YouTube
                        </button>
                        <button 
                            onClick={() => setType('embed')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${type === 'embed' ? 'bg-white dark:bg-gray-900 shadow-sm text-red-600' : 'text-gray-500'}`}
                        >
                            Embed Code
                        </button>
                    </div>
                </div>

                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Title</label>
                            <input 
                                type="text" placeholder="e.g. Real Madrid vs Barcelona"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={newHighlight.title}
                                onChange={e => setNewHighlight({...newHighlight, title: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Competition</label>
                            <input 
                                type="text" placeholder="e.g. La Liga"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={newHighlight.competition}
                                onChange={e => setNewHighlight({...newHighlight, competition: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">
                            {type === 'youtube' ? 'YouTube Video URL' : 'Raw Embed HTML (<iframe>...</iframe>)'}
                        </label>
                        <textarea 
                            rows={type === 'youtube' ? 1 : 4}
                            placeholder={type === 'youtube' ? "https://www.youtube.com/watch?v=..." : "<iframe ...></iframe>"}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                            value={newHighlight.content}
                            onChange={e => setNewHighlight({...newHighlight, content: e.target.value})}
                            required
                        />
                    </div>

                    {type === 'embed' && (
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Manual Thumbnail URL (Optional)</label>
                            <input 
                                type="text" placeholder="https://..."
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500"
                                value={newHighlight.thumbnail}
                                onChange={e => setNewHighlight({...newHighlight, thumbnail: e.target.value})}
                            />
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button 
                            disabled={saving}
                            className="bg-red-600 hover:bg-red-700 text-white px-10 py-3 rounded-xl font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-600/20"
                        >
                            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Save Highlight
                        </button>
                    </div>
                </form>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {highlights.map(h => (
                    <div key={h.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-black overflow-hidden shadow-sm group">
                        <div className="relative aspect-video">
                            <img src={h.thumbnail} className="w-full h-full object-cover" alt="" />
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-[9px] text-white font-black uppercase tracking-widest border border-white/10">
                                {h.type === 'youtube' ? 'YouTube' : 'Custom Embed'}
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-start">
                            <div className="max-w-[80%]">
                                <h3 className="font-bold text-gray-900 dark:text-white truncate">{h.title}</h3>
                                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mt-1">{h.competition}</p>
                            </div>
                            <button 
                                onClick={() => handleDelete(h.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HighlightsManager;
