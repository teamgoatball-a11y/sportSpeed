import { useState, useEffect } from 'react';
import { collection, query, orderBy, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * useArticles — subscribe to Firestore "articles" collection in real-time.
 * @param {object} options
 * @param {string|null} options.category  - filter by category (null = all)
 * @param {boolean}     options.publishedOnly - only show published articles (default true)
 * @param {number}      options.limitCount    - max results (default 50)
 */
export function useArticles({ category = null, publishedOnly = true, limitCount = 50 } = {}) {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        setLoading(true);
        setError(null);

        let q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));

        // To avoid Firebase demanding a composite index for where() + orderBy() on different fields,
        // we'll fetch ordered by date and apply the filters locally on the client.
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                if (publishedOnly) {
                    data = data.filter(a => a.published === true);
                }

                if (category && category !== 'All') {
                    data = data.filter(a => a.category === category);
                }

                if (limitCount) {
                    data = data.slice(0, limitCount);
                }

                setArticles(data);
                setLoading(false);
            },
            (err) => {
                console.error('useArticles error:', err);
                setError(err.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [category, publishedOnly, limitCount]);

    return { articles, loading, error };
}
