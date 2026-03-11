import React, { useState, useEffect } from 'react';

const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

export default function TeamLogo({ teamName, logoUrl, teamId, className = "w-8 h-8 object-contain" }) {
    // If the admin already saved an official logo to Firebase (or the API provided it upfront), use it.
    const [logo, setLogo] = useState(logoUrl || null);
    const [loading, setLoading] = useState(!logoUrl && !!teamId);

    useEffect(() => {
        // If we already have a logo, or we don't have an ID to look up, do nothing.
        if (logoUrl || !teamId) {
            setLoading(false);
            return;
        }

        const fetchLogo = async () => {
            // 1. Check if the browser has cached this specific team's logo to save API calls
            const cacheKey = `tsdb_logo_${teamId}`;
            const cachedLogo = localStorage.getItem(cacheKey);

            if (cachedLogo) {
                setLogo(cachedLogo);
                setLoading(false);
                return;
            }

            // 2. Fetch the team details from SportsDB if not cached
            try {
                const response = await fetch(`${API_BASE_URL}/lookupteam.php?id=${teamId}`);
                if (!response.ok) throw new Error("Network error");

                const data = await response.json();
                const badgeUrl = data?.teams?.[0]?.strBadge;

                if (badgeUrl) {
                    setLogo(badgeUrl);
                    localStorage.setItem(cacheKey, badgeUrl); // Cache it for future visits
                }

            } catch (err) {
                console.error("Failed to fetch team logo for", teamName, err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogo();
    }, [teamId, logoUrl, teamName]);

    // If we successfully resolved a logo image URL (either via props or fetch)
    if (logo) {
        return <img src={logo} alt={teamName} className={className} />;
    }

    // Fallback styling if absolutely no logo could be found, or while loading
    const fallbackLetters = teamName ? teamName.substring(0, 2).toUpperCase() : '??';

    return (
        <div className={`rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 ${className.replace('object-contain', '')}`}>
            {loading ? (
                <span className="w-4 h-4 rounded-full border-2 border-gray-300 border-t-red-500 animate-spin"></span>
            ) : (
                fallbackLetters
            )}
        </div>
    );
}
