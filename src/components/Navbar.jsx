import { Link, useLocation } from "react-router-dom"

function Navbar({ searchQuery, setSearchQuery, isDarkMode, toggleTheme }) {
    const location = useLocation()
    const isHome = location.pathname === "/"

    return (
        <nav className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 shadow-sm transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">

                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="flex flex-col justify-center">
                            <span className="text-2xl sm:text-3xl font-black italic tracking-tighter text-gray-900 dark:text-white transition-colors duration-300">
                                GOAT<span className="text-red-500">BALL</span>
                            </span>
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase mt-0.5">
                                Your Home for Live Sports
                            </span>
                        </Link>
                    </div>

                    {/* Search Bar */}
                    {isHome && (
                        <div className="flex-1 min-w-0 max-w-xs sm:max-w-md lg:max-w-lg lg:ml-8 lg:mr-auto justify-end sm:justify-start">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 dark:text-gray-500 group-focus-within:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search teams, leagues..."
                                    className="block w-full pl-9 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-gray-300 dark:border-gray-700 rounded-full leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-300 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-red-500 dark:focus:border-gray-600 focus:ring-1 focus:ring-red-500 transition-colors text-xs sm:text-sm shadow-sm"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-white"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="hidden lg:flex items-center ml-auto gap-4">
                        <div className="flex items-baseline space-x-1">
                            <Link to="/" className="text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full text-sm font-medium transition-colors">Home</Link>
                            <Link to="/news" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors">News</Link>
                            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors hidden xl:block">Football</Link>
                            <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors hidden xl:block">Cricket</Link>
                        </div>
                    </div>

                    {/* Theme Toggle Button */}
                    <div className="flex items-center">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            aria-label="Toggle Theme"
                        >
                            {isDarkMode ? (
                                // Sun Icon for Dark Mode
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                                </svg>
                            ) : (
                                // Moon Icon for Light Mode
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                                </svg>
                            )}
                        </button>
                    </div>

                </div>



            </div>
        </nav>
    )
}

export default Navbar
