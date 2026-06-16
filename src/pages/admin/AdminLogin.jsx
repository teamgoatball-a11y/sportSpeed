import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import siteSettings from '../../config/siteSettings';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            await login(email, password);
            toast.success('Login successful!');
            navigate('/admin/dashboard');
        } catch (err) {
            console.error(err);
            setError('Failed to sign in: Invalid credentials');
            toast.error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-300">

            {/* Back Button */}
            <div className="absolute top-6 left-6">
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Site</span>
                </button>
            </div>

            <div className="max-w-md w-full animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 dark:text-white mb-2">
                        {siteSettings.isSportSpeed ? (
                            <>SPORT<span className="text-red-600 dark:text-red-500">SPEED</span></>
                        ) : (
                            <>GOAT<span className="text-red-600 dark:text-red-500">BALL</span></>
                        )}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium tracking-wide uppercase text-sm">
                        Admin Portal Access
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-black shadow-xl shadow-gray-200/50 dark:shadow-2xl transition-colors duration-300">

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400 rounded-xl border border-black flex items-center gap-3 text-sm">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={20} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder-gray-400"
                                    placeholder={`admin@${siteSettings.domain}`}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg transition-all duration-300 shadow-lg ${loading
                                    ? 'bg-red-400 cursor-not-allowed shadow-none'
                                    : 'bg-red-600 hover:bg-red-500 hover:shadow-red-600/30 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                        </button>

                    </form>
                </div>

                <p className="text-center text-sm text-gray-500 dark:text-gray-500 mt-8">
                    Secure access restricted to authorized personnel only.
                </p>

            </div>
        </div>
    );
};

export default AdminLogin;
