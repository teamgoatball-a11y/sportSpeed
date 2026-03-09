import { Link } from 'react-router-dom';

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-900 mt-20 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

                    {/* Brand & About */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="inline-block mb-4">
                            <span className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white transition-colors duration-300">
                                SPORTS<span className="text-red-500">LIVE</span>
                            </span>
                        </Link>
                        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-sm transition-colors duration-300">
                            Your ultimate destination for live sports streaming. Watch premium matches, stay updated with live scores, and never miss a moment of the action.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase text-sm tracking-wider transition-colors duration-300">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            <li><Link to="/" className="hover:text-red-500 transition-colors">Home</Link></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">Football Streams</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">Cricket Streams</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">Live Scores</a></li>
                        </ul>
                    </div>

                    {/* Legal / Social Placeholder */}
                    <div>
                        <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase text-sm tracking-wider transition-colors duration-300">Legal</h3>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                            <li><a href="#" className="hover:text-red-500 transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">DMCA Disclaimer</a></li>
                            <li><a href="#" className="hover:text-red-500 transition-colors">Contact Us</a></li>
                        </ul>
                    </div>

                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 dark:border-gray-900 my-8 transition-colors duration-300"></div>

                {/* Copyright */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-500 dark:text-gray-500 text-sm text-center md:text-left transition-colors duration-300">
                        &copy; {currentYear} SportsLive. All rights reserved. This site does not host any streams.
                    </p>
                </div>

            </div>
        </footer>
    );
}

export default Footer
