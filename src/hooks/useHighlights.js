import { useState, useEffect } from 'react';

const SCOREBAT_API_URL = 'https://www.scorebat.com/video-api/v3/feed/';

// Utility to create a URL-friendly slug from title
export const createSlug = (title) => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-0]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
};

export const useHighlights = () => {
    const [highlights, setHighlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHighlights = async () => {
            try {
                const response = await fetch(SCOREBAT_API_URL);
                if (!response.ok) throw new Error('Failed to fetch highlights');
                
                const data = await response.json();
                
                // Process data to add slugs and cleaner structure
                const processed = data.response.map(item => ({
                    ...item,
                    slug: createSlug(item.title),
                    // ScoreBat v3 usually has thumbnail in the JSON, 
                    // otherwise we can try to extract from embed or use a fallback
                    thumb: item.thumbnail || `https://via.placeholder.com/640x360?text=${encodeURIComponent(item.title)}`
                }));

                setHighlights(processed);
                setError(null);
            } catch (err) {
                console.error('ScoreBat API Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchHighlights();
    }, []);

    return { highlights, loading, error };
};
