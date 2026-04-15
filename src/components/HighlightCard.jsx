import React from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

function HighlightCard({ highlight }) {
    return (
        <Link 
            to={`/highlights/${highlight.slug}`} 
            className="group block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:border-red-500/50 dark:hover:border-red-500/50 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1"
        >
            <div className="relative aspect-video overflow-hidden">
                <img 
                    src={highlight.thumbnail} 
                    alt={highlight.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800';
                        e.target.onerror = null;
                    }}
                />
                
                {/* Overlay with Play Button */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 duration-300">
                    <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white transform scale-75 group-hover:scale-100 transition-transform shadow-lg">
                        <Play fill="currentColor" size={20} className="ml-1" />
                    </div>
                </div>

                {/* Competition Tag */}
                <div className="absolute top-3 left-3">
                    <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-widest border border-white/10">
                        {highlight.competition}
                    </span>
                </div>
            </div>

            <div className="p-4">
                <h3 className="text-gray-900 dark:text-white font-bold text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-red-600 dark:group-hover:text-red-500 transition-colors font-display italic">
                    {highlight.title}
                </h3>
            </div>
        </Link>
    );
}

export default HighlightCard;
