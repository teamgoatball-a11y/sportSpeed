import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    collection, doc, getDoc, addDoc, updateDoc, serverTimestamp
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Save, ArrowLeft, Eye, EyeOff, Image } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['Football', 'Cricket', 'IPL', 'General'];

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

const EMPTY_FORM = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'General',
    tags: '',
    coverImage: '',
    author: 'Admin',
    published: false,
};

const ArticleForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();

    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(isEdit);
    const [saving, setSaving] = useState(false);
    const [previewMode, setPreviewMode] = useState(false);
    const [slugEdited, setSlugEdited] = useState(false);

    // Load existing article for edit
    useEffect(() => {
        if (!isEdit) return;
        (async () => {
            try {
                const snap = await getDoc(doc(db, 'articles', id));
                if (snap.exists()) {
                    const data = snap.data();
                    setForm({
                        title: data.title || '',
                        slug: data.slug || '',
                        excerpt: data.excerpt || '',
                        content: data.content || '',
                        category: data.category || 'General',
                        tags: Array.isArray(data.tags) ? data.tags.join(', ') : (data.tags || ''),
                        coverImage: data.coverImage || '',
                        author: data.author || 'Admin',
                        published: data.published || false,
                    });
                    setSlugEdited(true); // Don't auto-regenerate slug on edit
                } else {
                    toast.error('Article not found');
                    navigate('/admin/articles');
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load article');
            } finally {
                setLoading(false);
            }
        })();
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => {
            const next = { ...prev, [name]: type === 'checkbox' ? checked : value };
            // Auto-generate slug from title (unless user has manually edited slug)
            if (name === 'title' && !slugEdited) {
                next.slug = generateSlug(value);
            }
            return next;
        });
    };

    const handleSlugChange = (e) => {
        setSlugEdited(true);
        setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) { toast.error('Title is required'); return; }
        if (!form.slug.trim()) { toast.error('Slug is required'); return; }
        if (!form.content.trim()) { toast.error('Content is required'); return; }

        setSaving(true);
        const payload = {
            title: form.title.trim(),
            slug: form.slug.trim(),
            excerpt: form.excerpt.trim(),
            content: form.content.trim(),
            category: form.category,
            tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
            coverImage: form.coverImage.trim(),
            author: form.author.trim() || 'Admin',
            published: form.published,
            updatedAt: serverTimestamp(),
        };

        try {
            if (isEdit) {
                await updateDoc(doc(db, 'articles', id), payload);
                toast.success('Article updated!');
            } else {
                await addDoc(collection(db, 'articles'), {
                    ...payload,
                    createdAt: serverTimestamp(),
                });
                toast.success('Article created!');
            }
            navigate('/admin/articles');
        } catch (err) {
            console.error(err);
            toast.error('Failed to save article');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-4xl">

            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/articles')}
                        className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isEdit ? 'Edit Article' : 'New Article'}
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            {isEdit ? 'Update the article details below' : 'Fill in the details to publish a new article'}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setPreviewMode(p => !p)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
                    >
                        {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
                        {previewMode ? 'Edit' : 'Preview'}
                    </button>
                </div>
            </div>

            {previewMode ? (
                /* ─── Content Preview ─── */
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    {form.coverImage && (
                        <img src={form.coverImage} alt="Cover" className="w-full h-64 object-cover" />
                    )}
                    <div className="p-8">
                        <span className="text-xs font-semibold uppercase tracking-wider text-red-500">{form.category}</span>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white mt-2 mb-4">{form.title || 'Untitled Article'}</h2>
                        {form.excerpt && <p className="text-lg text-gray-500 dark:text-gray-400 mb-6 border-l-4 border-red-500 pl-4 italic">{form.excerpt}</p>}
                        <div className="prose prose-gray dark:prose-invert max-w-none">
                            <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed">{form.content}</pre>
                        </div>
                    </div>
                </div>
            ) : (
                /* ─── Edit Form ─── */
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Cover Image */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <Image size={18} className="text-red-500" /> Cover Image
                        </h2>
                        <input
                            name="coverImage"
                            value={form.coverImage}
                            onChange={handleChange}
                            placeholder="Paste image URL (e.g. https://example.com/image.jpg)"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
                        />
                        {form.coverImage && (
                            <div className="mt-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 h-48">
                                <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            </div>
                        )}
                    </div>

                    {/* Core Fields */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-4">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Article Details</h2>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                                placeholder="e.g. Manchester City Win Champions League"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm font-medium"
                                required
                            />
                        </div>

                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                URL Slug <span className="text-red-500">*</span>
                                <span className="text-xs text-gray-400 ml-2 font-normal">(auto-generated from title)</span>
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">/news/</span>
                                <input
                                    value={form.slug}
                                    onChange={handleSlugChange}
                                    placeholder="article-url-slug"
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt / Summary</label>
                            <textarea
                                name="excerpt"
                                value={form.excerpt}
                                onChange={handleChange}
                                rows={2}
                                placeholder="Short description shown on article cards..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm resize-none"
                            />
                        </div>

                        {/* Category + Author */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
                                >
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author</label>
                                <input
                                    name="author"
                                    value={form.author}
                                    onChange={handleChange}
                                    placeholder="Author name"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
                                />
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags <span className="text-xs text-gray-400 font-normal">(comma separated)</span></label>
                            <input
                                name="tags"
                                value={form.tags}
                                onChange={handleChange}
                                placeholder="e.g. football, Premier League, goals"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 space-y-3">
                        <h2 className="font-semibold text-gray-900 dark:text-white">Content <span className="text-red-500">*</span></h2>
                        <p className="text-xs text-gray-400">Write your full article here. Plain text is supported.</p>
                        <textarea
                            name="content"
                            value={form.content}
                            onChange={handleChange}
                            rows={18}
                            placeholder="Write your full article content here..."
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition text-sm font-mono leading-relaxed resize-y"
                            required
                        />
                    </div>

                    {/* Publish + Submit */}
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    name="published"
                                    checked={form.published}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-checked:bg-red-600 transition-colors"></div>
                                <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {form.published ? 'Published' : 'Save as Draft'}
                                </p>
                                <p className="text-xs text-gray-400">
                                    {form.published ? 'Visible to all visitors' : 'Only visible in admin'}
                                </p>
                            </div>
                        </label>

                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-400 text-white rounded-xl font-semibold transition-colors shadow-sm shadow-red-600/20"
                        >
                            <Save size={18} />
                            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Article'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ArticleForm;
