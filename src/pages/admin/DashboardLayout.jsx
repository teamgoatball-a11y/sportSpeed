import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardLayout = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await logout();
            toast.success('Logged out successfully');
            navigate('/admin/login');
        } catch (error) {
            console.error(error);
            toast.error('Failed to log out');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col md:flex-row transition-colors duration-300">

            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-300">

                {/* Brand */}
                <div className="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
                    <Link to="/" className="text-xl font-black italic tracking-tighter text-gray-900 dark:text-white">
                        SPORTS<span className="text-red-600 dark:text-red-500">ADMIN</span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link
                        to="/admin/dashboard"
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${location.pathname === '/admin/dashboard' || location.pathname.includes('/admin/matches')
                                ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 font-semibold'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white font-medium'
                            }`}
                    >
                        <LayoutDashboard size={20} />
                        Matches
                    </Link>

                    <Link
                        to="/"
                        target="_blank" // Open live site in new tab
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white font-medium transition-all duration-200"
                    >
                        <ShieldAlert size={20} />
                        View Live Site
                    </Link>
                </nav>

                {/* User / Logout */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">
                                {currentUser?.email}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">Administrator</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 text-gray-700 dark:text-gray-300 rounded-xl transition-all duration-200 text-sm font-medium"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Mobile Header (Only visible on small screens) */}
                <header className="md:hidden h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 justify-between transition-colors duration-300">
                    <span className="font-bold text-gray-900 dark:text-white">Admin Dashboard</span>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
                    <Outlet />
                </div>

            </main>

        </div>
    );
};

export default DashboardLayout;
