import { Link } from 'react-router-dom';
import siteSettings from '../config/siteSettings';
import { useArticles } from '../hooks/useArticles';

function Footer() {
    const currentYear = new Date().getFullYear();
    const { articles } = useArticles({ publishedOnly: true });
    const latestArticles = articles.slice(0, 2);

    return (
        <footer className="relative mt-20 border-t border-gray-800/50 overflow-hidden">
            {/* Background Image & Overlays */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=2000&auto=format&fit=crop"
                    alt="Stadium Lights"
                    className="w-full h-full object-cover object-center opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#111] via-[#111]/90 to-black"></div>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-8">

                    {/* Column 1: Brand & Contact (Wider) */}
                    <div className="md:col-span-5 lg:col-span-4 pr-0 lg:pr-8">
                        <Link to="/" className="inline-block mb-8 group">
                            <div className="flex items-center gap-3">
                                {!siteSettings.isSportSpeed && (
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform bg-white/5 border border-white/10 p-1">
                                        <img src="/logo.png?v=4" alt={`${siteSettings.name} Logo`} className="w-full h-full object-contain rounded-xl" />
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="text-3xl font-black italic tracking-tighter text-white uppercase font-display leading-none">
                                        {siteSettings.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold tracking-[0.3em] uppercase mt-1">
                                        Elite Sports Hub
                                    </span>
                                </div>
                            </div>
                        </Link>

                        <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                            Your ultimate destination for live sports streaming, real-time scores, and breaking news. Experience the game like never before.
                        </p>

                        <div className="flex items-center gap-3 mb-8">
                            <a href={siteSettings.social.facebook.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:text-white text-gray-400 transition-all text-sm shadow-sm hover:shadow-red-600/20 hover:-translate-y-1">f</a>
                            <a href={siteSettings.social.twitter.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:text-white text-gray-400 transition-all text-sm font-serif shadow-sm hover:shadow-red-600/20 hover:-translate-y-1">𝕏</a>
                            <a href={siteSettings.social.youtube.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:text-white text-gray-400 transition-all text-sm shadow-sm hover:shadow-red-600/20 hover:-translate-y-1">yt</a>
                            <a href={siteSettings.social.instagram.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 hover:border-red-500 hover:text-white text-gray-400 transition-all text-sm shadow-sm hover:shadow-red-600/20 hover:-translate-y-1">ig</a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="md:col-span-3 lg:col-span-3">
                        <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-[0.2em] relative inline-block">
                            Navigation
                            <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-red-600 rounded-full"></span>
                        </h3>
                        <div className="flex flex-col gap-y-4 text-sm font-medium">
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                <span className="group-hover:translate-x-1 transition-transform">Home</span>
                            </Link>
                            <Link to="/news" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                <span className="group-hover:translate-x-1 transition-transform">Latest News</span>
                            </Link>
                            <Link to="/highlights" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                <span className="group-hover:translate-x-1 transition-transform">Video Highlights</span>
                            </Link>
                            <Link to="/contact" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                <span className="group-hover:translate-x-1 transition-transform">Contact Us</span>
                            </Link>
                            <Link to="/download" className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-2 group font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 transition-opacity animate-pulse"></span>
                                <span className="group-hover:translate-x-1 transition-transform">Download App</span>
                            </Link>
                        </div>
                    </div>

                    {/* Column 3: Recent News */}
                    <div className="md:col-span-4 lg:col-span-5">
                        <h3 className="text-white font-bold text-sm mb-6 uppercase tracking-[0.2em] relative inline-block">
                            Latest Updates
                            <span className="absolute -bottom-2 left-0 w-1/2 h-0.5 bg-red-600 rounded-full"></span>
                        </h3>
                        <ul className="space-y-4">
                            {latestArticles.map(article => (
                                <li key={article.id}>
                                    <Link to={`/news/${article.slug}`} className="group flex gap-4 items-start p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/5 transition-all">
                                        {article.imageUrl ? (
                                            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ) : (
                                            <div className="w-16 h-16 rounded-xl bg-gray-800 flex flex-shrink-0 items-center justify-center">
                                                <span className="text-gray-600">News</span>
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="text-gray-200 font-bold mb-1 group-hover:text-red-400 transition-colors leading-snug line-clamp-2 text-sm">
                                                {article.title}
                                            </h4>
                                            <span className="text-xs text-gray-500 font-medium">
                                                {article.createdAt && (article.createdAt.toDate ? article.createdAt.toDate() : new Date(article.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            {latestArticles.length === 0 && (
                                <li className="text-gray-500 text-sm italic p-3">No recent news available.</li>
                            )}
                        </ul>
                    </div>

                </div>
            </div>

            {/* Copyright & Legal Bar */}
            <div className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-500">
                    <p>
                        &copy; {currentYear} {siteSettings.name}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/p/terms" className="hover:text-white transition-colors">Terms of Use</Link>
                        <Link to="/p/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/p/dmca" className="hover:text-white transition-colors">DMCA Disclaimer</Link>
                    </div>
                </div>
            </div>

        </footer>
    );
}

export default Footer;
