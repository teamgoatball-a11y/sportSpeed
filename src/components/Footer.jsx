import { Link } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';

function Footer() {
    const currentYear = new Date().getFullYear();
    const { articles } = useArticles({ publishedOnly: true });
    const latestArticles = articles.slice(0, 2);

    return (
        <footer className="bg-[#151515] text-gray-400 mt-20 relative overflow-hidden">
            {/* Optional subtle background map/pattern can go here */}
            {/* <div className="absolute inset-0 opacity-[0.03] bg-[url('/world-map.png')] bg-center bg-no-repeat bg-cover pointer-events-none"></div> */}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-24">

                    {/* Column 1: Brand & Contact */}
                    <div>
                        <Link to="/" className="inline-block mb-6 flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#f00000] text-white rounded-full flex items-center justify-center font-black italic text-xl">
                                G
                             </div>
                            <span className="text-2xl font-extrabold tracking-widest text-white uppercase">
                                GOATBALL
                            </span>
                        </Link>
                        
                        <ul className="space-y-4 text-[13px] mb-8">
                            <li className="flex items-start gap-4">
                                <span className="text-[#f00000] mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                                </span>
                                <a href="mailto:info.goatball@gmail.com" className="hover:text-white transition-colors">info.goatball@gmail.com</a>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f00000] mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
                                </span>
                                <span>+1 (123) 456 789 00</span>
                            </li>
                            <li className="flex items-start gap-4">
                                <span className="text-[#f00000] mt-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                                </span>
                                <div>
                                    <p>123 Sports Avenue, Suite 100</p>
                                    <p>New York City, United States</p>
                                </div>
                            </li>
                        </ul>

                        <div className="flex items-center gap-2">
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#f00000] hover:border-[#f00000] hover:text-white transition-all text-sm">f</a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#f00000] hover:border-[#f00000] hover:text-white transition-all text-sm">t</a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#f00000] hover:border-[#f00000] hover:text-white transition-all text-sm">in</a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-[#f00000] hover:border-[#f00000] hover:text-white transition-all text-sm">ig</a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Quick Links</h3>
                        <div className="flex flex-col gap-y-3 text-[14px]">
                            <Link to="/" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> Home
                            </Link>
                            <Link to="/" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> Live Matches
                            </Link>
                            <Link to="/news" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> Latest News
                            </Link>
                            <Link to="/p/terms" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> Terms & Conditions
                            </Link>
                            <Link to="/p/privacy" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> Privacy Policy
                            </Link>
                            <Link to="/p/dmca" className="hover:text-[#f00000] transition-colors flex items-center gap-2">
                                <span className="text-gray-600">›</span> DMCA Disclaimer
                            </Link>
                        </div>
                    </div>

                    {/* Column 3: Recent News */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wide">Recent News</h3>
                        <ul className="space-y-6">
                            {latestArticles.map(article => (
                                <li key={article.id}>
                                    <Link to={`/news/${article.slug}`} className="group block">
                                        <h4 className="text-white font-bold mb-2 group-hover:text-[#f00000] transition-colors leading-snug line-clamp-2">
                                            {article.title}
                                        </h4>
                                        <div className="flex items-center gap-3 text-[12px] font-medium">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[#f00000]">📅</span> 
                                                <span className="text-gray-500">
                                                    {article.createdAt && (article.createdAt.toDate ? article.createdAt.toDate() : new Date(article.createdAt)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[#f00000]">👁️</span> 
                                                <span className="text-gray-500">{article.views || 0} Views</span>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                            {latestArticles.length === 0 && (
                                <li className="text-gray-500 text-sm italic">No recent news available.</li>
                            )}
                        </ul>
                    </div>

                </div>
            </div>

            {/* Copyright Bar */}
            <div className="border-t border-gray-800 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px]">
                    <p>
                        Copyright &copy; {currentYear} All rights reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        <Link to="/p/terms" className="hover:text-white transition-colors">Terms of Use</Link>
                        <Link to="/p/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="/p/dmca" className="hover:text-white transition-colors">DMCA</Link>
                    </div>
                </div>
            </div>

        </footer>
    );
}

export default Footer;
