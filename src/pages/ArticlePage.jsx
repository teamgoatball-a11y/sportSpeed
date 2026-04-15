import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Calendar, Clock, ArrowLeft, Tag, User, Eye } from 'lucide-react';
import ArticleCard from '../components/ArticleCard';

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function readingTime(content) {
    if (!content) return '1 min read';
    const words = content.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.round(words / 200));
    return `${mins} min read`;
}

function ArticlePage() {
    const { slug } = useParams();
    const [article, setArticle] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchArticle = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch main article by slug
                const q = query(
                    collection(db, 'articles'),
                    where('slug', '==', slug),
                    where('published', '==', true),
                    limit(1)
                );
                const snap = await getDocs(q);
                if (snap.empty) {
                    setError('Article not found or is unpublished.');
                    setLoading(false);
                    return;
                }
                const docData = snap.docs[0];
                const articleData = { id: docData.id, ...docData.data() };
                setArticle(articleData);
                if (articleData.title) {
                    document.title = `${articleData.title} | GOATBALL News`;
                }

                // Fetch related articles (same category, excluding current)
                if (articleData.category) {
                    // Fetch all ordered by date, filter locally to avoid composite index error
                    const relatedQ = query(
                        collection(db, 'articles'),
                        orderBy('createdAt', 'desc')
                    );
                    const relatedSnap = await getDocs(relatedQ);
                    const relatedData = relatedSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(a => a.published === true && a.category === articleData.category && a.id !== articleData.id)
                        .slice(0, 3); // Just want 3 max
                    setRelated(relatedData);
                }

                // Increment view count if not already viewed in this session
                const viewedKey = `viewed_article_${articleData.id}`;
                if (!sessionStorage.getItem(viewedKey)) {
                    try {
                        await updateDoc(doc(db, 'articles', articleData.id), {
                            views: increment(1)
                        });
                        sessionStorage.setItem(viewedKey, 'true');
                        // Optimistically update local state so UI shows the new view
                        setArticle(prev => ({ ...prev, views: (prev.views || 0) + 1 }));
                    } catch (e) {
                        console.error('Error updating views:', e);
                    }
                }
            } catch (err) {
                console.error(err);
                setError('Failed to load article.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
        window.scrollTo(0, 0);

        return () => {
            document.title = "GOATBALL — Live Sports, Highlights & News";
        };
    }, [slug]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="text-center py-32 space-y-4 animate-fade-in">
                <div className="text-6xl mb-4">📰</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Oops!</h2>
                <p className="text-gray-500 dark:text-gray-400">{error || 'Article not found.'}</p>
                <Link to="/news" className="inline-block mt-4 text-red-600 hover:underline">
                    &larr; Back to News
                </Link>
            </div>
        );
    }

    return (
        <article className="max-w-4xl mx-auto py-8 px-4 sm:px-6 animate-fade-in w-full">
            <Link to="/news" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500 transition-colors mb-6 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                Back to News
            </Link>

            {/* Header */}
            <header className="mb-8 space-y-4">
                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 font-bold text-xs uppercase tracking-wider rounded-md border border-red-200 dark:border-red-500/20">
                    {article.category || 'General'}
                </span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight">
                    {article.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-sm text-gray-500 dark:text-gray-400 pt-2 font-medium">
                    <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                        <User size={16} className="text-red-500" />
                        {article.author || 'Admin'}
                    </div>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <div className="flex items-center gap-1.5">
                        <Calendar size={16} />
                        {formatDate(article.createdAt)}
                    </div>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <div className="flex items-center gap-1.5">
                        <Clock size={16} />
                        {readingTime(article.content)}
                    </div>
                    <span className="w-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full"></span>
                    <div className="flex items-center gap-1.5">
                        <Eye size={16} />
                        {article.views || 0} views
                    </div>
                </div>
            </header>

            {/* Cover Image */}
            {article.coverImage && (
                <div className="w-full rounded-2xl overflow-hidden mb-10 shadow-lg border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900 flex justify-center items-center">
                    <img 
                        src={article.coverImage} 
                        alt={article.title} 
                        className="w-full h-auto max-h-[600px] object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            )}

            {/* Content */}
            <div className="prose prose-lg sm:prose-xl prose-gray dark:prose-invert max-w-none mb-12">
                <pre className="whitespace-pre-wrap font-sans text-gray-800 dark:text-gray-200 leading-[1.8]">{article.content}</pre>
            </div>

            {/* Tags */}
            {article.tags && Array.isArray(article.tags) && article.tags.length > 0 && (
                <div className="flex items-center gap-2 mb-16 flex-wrap border-t border-gray-200 dark:border-gray-800 pt-8 mt-8">
                    <Tag size={18} className="text-gray-400" />
                    {article.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full font-medium border border-gray-200 dark:border-gray-700">
                            #{tag.replace(/\s+/g, '')}
                        </span>
                    ))}
                </div>
            )}

            {/* Related Articles */}
            {related.length > 0 && (
                <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 italic tracking-tight">More in {article.category}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {related.map(rel => (
                            <ArticleCard key={rel.id} article={rel} />
                        ))}
                    </div>
                </div>
            )}
        </article>
    );
}

export default ArticlePage;
