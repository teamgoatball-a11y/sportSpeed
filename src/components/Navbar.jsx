import { useState, useEffect } from "react"
import { Link, useLocation } from "react-router-dom"
import { useUI } from "../context/UIContext"
import siteSettings from "../config/siteSettings"

function Navbar() {
    const { searchQuery, setSearchQuery, isDarkMode, toggleTheme, isAppInstalled } = useUI()
    const location = useLocation()
    const isHome = location.pathname === "/"
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    // Close mobile menu when route changes
    useEffect(() => {
        setIsMobileMenuOpen(false)
    }, [location.pathname])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="glass sticky top-[0px] z-50 transition-all duration-300 shadow-sm border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">

                        {/* Hamburger Button (Mobile) */}
                        <div className="flex lg:hidden">
                            <button 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="p-2 -ml-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>
                        </div>

                        {/* Logo */}
                        <div className="flex-shrink-0 flex items-center lg:ml-0 flex-1 lg:flex-none justify-center lg:justify-start">
                            <Link to="/" className="flex flex-col justify-center group">
                                <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white transition-colors duration-300 font-display">
                                    {siteSettings.isSportSpeed ? (
                                        <>SPORT<span className="text-red-600 group-hover:text-red-500 transition-colors">SPEED</span></>
                                    ) : (
                                        <>GOAT<span className="text-red-600 group-hover:text-red-500 transition-colors">BALL</span></>
                                    )}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 font-bold tracking-widest uppercase mt-0.5 ml-0.5 hidden sm:block">
                                    Elite Sports Hub
                                </span>
                            </Link>
                        </div>

                        {/* Search Bar */}
                        {isHome && (
                            <div className="hidden sm:flex flex-1 min-w-0 max-w-md lg:ml-8 lg:mr-auto">
                                <div className="relative group w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search teams, leagues..."
                                        className="block w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800 focus:border-red-500 dark:focus:border-red-500/50 focus:ring-4 focus:ring-red-500/10 transition-all text-sm shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                                        >
                                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center ml-auto gap-4">
                            <div className="flex items-baseline space-x-1">
                                <Link to="/" className={`px-5 py-2 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${isHome ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'}`}>Home</Link>
                                <Link to="/news" className={`px-5 py-2 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${location.pathname.startsWith('/news') ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'}`}>News</Link>
                                <Link to="/highlights" className={`px-5 py-2 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all duration-300 ${location.pathname.startsWith('/highlights') ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-red-600 dark:hover:text-red-400'}`}>Highlights</Link>
                            </div>
                        </div>

                        {/* Right Actions (Download + Theme) */}
                        <div className="flex items-center gap-2 sm:gap-3 lg:ml-2">
                            {/* Download Button */}
                            {!isAppInstalled && (
                                <Link to="/download" className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-2xl shadow-[0_4px_15px_rgba(220,38,38,0.3)] hover:shadow-[0_6px_20px_rgba(220,38,38,0.4)] transition-all transform hover:-translate-y-0.5">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    <span className="hidden sm:inline">App</span>
                                </Link>
                            )}

                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 sm:p-2.5 rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-300 focus:outline-none"
                                aria-label="Toggle Theme"
                            >
                                {isDarkMode ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                    </div>

                    {/* Mobile Search Bar (Only shown on mobile when on home page) */}
                    {isHome && (
                        <div className="sm:hidden pb-3">
                            <div className="relative group w-full">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search matches..."
                                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-2xl leading-5 bg-gray-50/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all text-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>

                    {/* Drawer */}
                    <div className="fixed inset-y-0 left-0 w-[80%] max-w-sm bg-white dark:bg-[#111] shadow-2xl flex flex-col transition-transform transform translate-x-0">
                        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                            <span className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white font-display">
                                {siteSettings.isSportSpeed ? (
                                    <>SPORT<span className="text-red-600">SPEED</span></>
                                ) : (
                                    <>GOAT<span className="text-red-600">BALL</span></>
                                )}
                            </span>
                            <button 
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-2 -mr-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                            <Link to="/" className={`block px-4 py-3 rounded-2xl text-base font-bold uppercase tracking-wider transition-colors ${isHome ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                Home
                            </Link>
                            <Link to="/news" className={`block px-4 py-3 rounded-2xl text-base font-bold uppercase tracking-wider transition-colors ${location.pathname.startsWith('/news') ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                News
                            </Link>
                            <Link to="/highlights" className={`block px-4 py-3 rounded-2xl text-base font-bold uppercase tracking-wider transition-colors ${location.pathname.startsWith('/highlights') ? 'bg-red-50 dark:bg-red-500/10 text-red-600' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                                Highlights
                            </Link>
                            <div className="my-4 border-t border-gray-100 dark:border-gray-800"></div>
                            <p className="px-4 py-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Categories</p>
                            <Link to="/" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Football</Link>
                            <Link to="/" className="block px-4 py-3 rounded-2xl text-base font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cricket</Link>
                        </div>
                        
                        <div className="p-5 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-center text-gray-400 font-medium">© {new Date().getFullYear()} {siteSettings.name}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar
