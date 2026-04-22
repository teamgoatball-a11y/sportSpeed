import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare } from 'lucide-react'; // Specer uses comments mostly, we will use Calendar

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function ArticleCard({ article, variant = 'grid' }) {
    const category = article.category || 'General';

    if (variant === 'featured') {
        return (
            <Link to={`/news/${article.slug}`} className="group relative overflow-hidden block aspect-[4/5] sm:aspect-square bg-gray-900">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                {/* Dark gradient overlay bottom-up */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                
                {/* Red Category Badge - Specer styled */}
                <div className="absolute top-0 left-0 bg-[#f00000] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 z-10">
                    {category}
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    <h3 className="text-white font-bold text-lg sm:text-xl leading-tight mb-2 group-hover:text-gray-200 transition-colors">
                        {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[11px] text-gray-300 font-medium tracking-wide">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#f00000]" />
                            <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <MessageSquare size={12} className="text-[#f00000]" />
                            <span>{article.views || 0} Views</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    if (variant === 'list') {
        return (
            <Link to={`/news/${article.slug}`} className="group flex items-center gap-4 py-4 bg-white dark:bg-[#111] border border-black px-4 rounded-xl transition-all">
                <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100 dark:bg-gray-800 overflow-hidden relative">
                     <img
                        src={article.coverImage}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
                <div className="flex flex-col justify-center flex-1 pr-2">
                    <h3 className="text-gray-900 dark:text-white font-bold text-[15px] leading-snug mb-2 group-hover:text-[#f00000] transition-colors line-clamp-2">
                        {article.title}
                    </h3>
                    <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-[#f00000]" />
                            <span>{formatDate(article.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#f00000]"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                            <span>{article.views || 0}</span>
                        </div>
                    </div>
                </div>
            </Link>
        );
    }

    // Default 'grid' variant - standard vertical card for Specer "Popular Post" grid style
    return (
        <Link to={`/news/${article.slug}`} className="group flex flex-col bg-white dark:bg-[#111] overflow-hidden border border-black rounded-xl transition-all">
            <div className="relative overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800 w-full">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.style.display = 'none'; }}
                />
                 {/* Blue/Category Badge top right or top left */}
                 <div className="absolute top-0 left-0 bg-[#0056b3] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 z-10">
                    {category}
                </div>
            </div>
            <div className="py-3">
                <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-[#f00000] transition-colors line-clamp-2">
                    {article.title}
                </h3>
                <div className="flex items-center gap-4 text-[11px] text-gray-500 font-medium">
                    <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#f00000]" />
                        <span>{formatDate(article.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MessageSquare size={12} className="text-[#f00000]" />
                        <span>{article.views || 0} Views</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}

export default ArticleCard;
