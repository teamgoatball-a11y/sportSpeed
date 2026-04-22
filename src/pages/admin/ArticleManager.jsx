import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, RefreshCw, Eye, EyeOff, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';

function formatDate(timestamp) {
    if (!timestamp) return '—';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

const ArticleManager = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
            const snap = await getDocs(q);
            setArticles(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (err) {
            console.error(err);
            toast.error('Failed to load articles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchArticles(); }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this article? This cannot be undone.')) return;
        try {
            await deleteDoc(doc(db, 'articles', id));
            toast.success('Article deleted');
            fetchArticles();
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete article');
        }
    };

    const handleTogglePublish = async (article) => {
        try {
            await updateDoc(doc(db, 'articles', article.id), { published: !article.published });
            toast.success(article.published ? 'Article unpublished' : 'Article published!');
            fetchArticles();
        } catch (err) {
            console.error(err);
            toast.error('Failed to update article');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-black shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Article Management</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your blog posts and sports news</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={fetchArticles}
                        className="p-2.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <Link
                        to="/admin/articles/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-colors shadow-sm shadow-red-600/20"
                    >
                        <Plus size={20} />
                        New Article
                    </Link>
                </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-black shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-gray-400 dark:text-gray-600" />
                        <p>Loading articles...</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Newspaper size={28} className="text-gray-400" />
                        </div>
                        <p className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Articles Yet</p>
                        <p className="text-sm">Click 'New Article' to write your first post.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-black text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    <th className="px-6 py-4">Title</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Views</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-black">
                                {articles.map((article) => (
                                    <tr key={article.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {article.coverImage && (
                                                    <img src={article.coverImage} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-black" />
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{article.title}</p>
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">{article.excerpt}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border border-black">
                                                {article.category || 'General'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {article.published ? (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-black">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                                    Published
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-bold bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400 border border-black">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                                                    Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                                                <Eye size={16} />
                                                <span className="text-sm font-semibold">{article.views || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                            {formatDate(article.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleTogglePublish(article)}
                                                    className={`p-2 rounded-lg transition-colors border border-transparent ${article.published
                                                        ? 'text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 hover:border-yellow-200 dark:hover:border-yellow-500/20'
                                                        : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 hover:border-emerald-200 dark:hover:border-emerald-500/20'
                                                        }`}
                                                    title={article.published ? 'Unpublish' : 'Publish'}
                                                >
                                                    {article.published ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                                <Link
                                                    to={`/admin/articles/edit/${article.id}`}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors border border-transparent hover:border-blue-200 dark:hover:border-blue-500/20"
                                                    title="Edit"
                                                >
                                                    <Edit2 size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(article.id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-500/20"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ArticleManager;
