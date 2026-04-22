import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import HighlightCard from '../components/HighlightCard';
import { Play, Search, Film, Loader2 } from 'lucide-react';

function HighlightsPage() {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'highlights'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setHighlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const filtered = highlights.filter(h => 
        h.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.competition.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in min-h-[80vh]">
            {/* Header */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase mb-3 font-display">
                        Match <span className="text-red-600">Highlights</span>
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium max-w-xl">
                        Official goals and match recaps manually curated for the GOATBALL community.
                    </p>
                </div>

                <div className="relative w-full md:w-80">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search highlights..."
                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-900 border border-black rounded-2xl focus:ring-2 focus:ring-red-500 outline-none transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filtered.map((highlight) => (
                        <HighlightCard key={highlight.id} highlight={highlight} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] border-2 border-dashed border-black">
                    <Film size={48} className="mx-auto text-gray-300 dark:text-gray-700 mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white uppercase tracking-tight italic">No Highlights Added Yet</h3>
                    <p className="text-gray-500 text-sm mt-2">Check back later or explore our Live Matches.</p>
                </div>
            )}
        </div>
    );
}

export default HighlightsPage;
