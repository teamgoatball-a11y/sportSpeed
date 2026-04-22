import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, RefreshCw } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useUI } from '../context/UIContext';
import siteSettings from '../config/siteSettings';
import ArticleCard from '../components/ArticleCard';
import { useArticles } from '../hooks/useArticles';

const CATEGORIES = ['All', 'Football', 'Cricket', 'IPL', 'General'];

function NewsPage() {
    const { searchQuery, setSearchQuery } = useUI();
    const [activeCategory, setActiveCategory] = useState('All');

    const { articles, loading } = useArticles({
        category: activeCategory === 'All' ? null : activeCategory,
        publishedOnly: true,
    });

    const filtered = articles.filter(a =>
        !searchQuery ||
        a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 transition-colors duration-300">
            <Helmet>
                <title>Latest Sports News | {siteSettings.name}</title>
                <meta name="description" content="Stay updated with the latest sports news, match reports, and transfers." />
                <meta property="og:title" content={`Latest Sports News | ${siteSettings.name}`} />
                <meta property="og:description" content="Latest football, cricket, and international sports updates." />
            </Helmet>

            {/* Page Header Area */}
            <div className="mb-6 mt-4">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] dark:text-white mb-2 uppercase tracking-wide">
                    Sports <span className="border-b-[3px] border-[#f00000] pb-1">News</span>
                </h1>
            </div>

            {/* Search Bar */}
            <div className="mb-5 relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 text-sm shadow-sm transition-colors"
                />
            </div>

            {/* Category Tabs */}
            <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar">
                <div className="flex space-x-3 min-w-max p-1">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeCategory === cat
                                ? "bg-white text-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-b-2 border-[#f00000]"
                                : "bg-transparent text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* 2-Column Specer Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Left Column: Popular Posts (List View) */}
                <div className="lg:col-span-2">
                    <div className="flex items-center mb-6">
                         <h2 className="text-xl sm:text-2xl font-extrabold text-[#111] dark:text-white tracking-wide uppercase">
                            Popular <span className="border-b-[3px] border-[#f00000] pb-1">Post</span>
                        </h2>
                    </div>

                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4 h-28 bg-gray-100 dark:bg-gray-800 rounded"></div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <div className="flex flex-col divide-y divide-gray-100 dark:divide-gray-800 border-t border-b border-gray-100 dark:border-gray-800">
                            {filtered.map(article => (
                                <ArticleCard key={article.id} article={article} variant="list" />
                            ))}
                        </div>
                    ) : (
                         <div className="text-center py-16 bg-gray-50 dark:bg-[#111] border border-black">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Articles Found</h3>
                            <p className="text-gray-500 text-sm">No articles match your criteria.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Follow Us Sidebar */}
                <div className="lg:col-span-1">
                    <div className="flex items-center mb-6">
                         <h2 className="text-xl sm:text-2xl font-extrabold text-[#111] dark:text-white tracking-wide uppercase">
                            Follow <span className="border-b-[3px] border-[#f00000] pb-1">Us</span>
                        </h2>
                    </div>

                    <div className="flex flex-col gap-2">
                        {/* Facebook */}
                        <a href={siteSettings.social.facebook.url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-4 py-3 bg-[#3b5998] hover:bg-[#2d4373] text-white text-sm font-bold transition-colors">
                            <span className="flex items-center gap-3">
                                <span className="text-lg">f</span>
                                <span>Facebook</span>
                            </span>
                            <span className="text-xs font-normal">{siteSettings.social.facebook.fans}</span>
                        </a>
                        {/* Twitter */}
                        <a href={siteSettings.social.twitter.url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-4 py-3 bg-[#55acee] hover:bg-[#2795e9] text-white text-sm font-bold transition-colors">
                            <span className="flex items-center gap-3">
                                <span className="text-lg text-xs">𝕏</span>
                                <span>Twitter</span>
                            </span>
                            <span className="text-xs font-normal">{siteSettings.social.twitter.fans}</span>
                        </a>
                        {/* YouTube */}
                        <a href={siteSettings.social.youtube.url} target="_blank" rel="noopener noreferrer" className="flex justify-between items-center px-4 py-3 bg-[#dd4b39] hover:bg-[#c23321] text-white text-sm font-bold transition-colors">
                            <span className="flex items-center gap-3">
                                <span className="text-lg">▶</span>
                                <span>YouTube</span>
                            </span>
                            <span className="text-xs font-normal">{siteSettings.social.youtube.fans}</span>
                        </a>
                    </div>

                    {/* Poll Widget Mockup */}
                    <div className="mt-8 bg-gray-900 border border-black p-6 relative overflow-hidden group rounded-xl">
                        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1518605368461-1b203c9ebc57?auto=format&fit=crop&q=80')] bg-cover bg-center"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-[#111]/80 to-transparent"></div>
                        
                        <div className="relative z-10">
                            <h3 className="text-white font-bold mb-6 text-[15px] leading-snug">{siteSettings.activePoll.question}</h3>
                            <div className="space-y-3 text-gray-300 text-sm font-medium">
                                {siteSettings.activePoll.options.map(option => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer hover:text-white transition-colors">
                                        <input type="radio" name="poll" className="accent-[#f00000]" />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div> {/* End Poll Widget */}
                </div> {/* End Right Column */}

            </div> {/* End of 2-Column Grid */}

        </div>
    );
}

export default NewsPage;
