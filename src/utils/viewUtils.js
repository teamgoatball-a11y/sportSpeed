export const getDisplayViews = (matchId, realViews) => {
    if (!matchId) return 0;
    
    const cacheKey = `display_views_${matchId}`;
    const now = Date.now();
    
    try {
        const cachedStr = sessionStorage.getItem(cacheKey);
        if (cachedStr) {
            const cached = JSON.parse(cachedStr);
            // If we have a cached value and it's less than 60 seconds old, return it.
            // This prevents the number from jumping every second if the user refreshes.
            if (now - cached.timestamp < 60000) {
                // Only bypass cache if admin completely reset the views to 0
                if (!(realViews === 0 && cached.views > 10)) {
                    return cached.views;
                }
            }
        }
        
        // Calculate new dummy views
        const dummyViews = (realViews || 0) * 5 + 1;
        
        // Save to cache with current timestamp
        sessionStorage.setItem(cacheKey, JSON.stringify({ 
            views: dummyViews, 
            timestamp: now 
        }));
        
        return dummyViews;
    } catch (e) {
        // Fallback in case sessionStorage fails (e.g., incognito mode restrictions)
        return (realViews || 0) * 5 + 1;
    }
};
