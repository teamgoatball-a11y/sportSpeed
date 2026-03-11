import { useState, useCallback } from 'react';

// Free community tier endpoint for SportsDB
const API_BASE_URL = 'https://www.thesportsdb.com/api/v1/json/3';

// Top leagues to search for Today/Tomorrow matches.
// Kept concise to avoid API rate-limiting (free tier: 30 req/min).
const POPULAR_LEAGUES = [
    "UEFA Champions League",
    "English Premier League",
    "Spanish La Liga",
    "Italian Serie A",
    "German Bundesliga",
    "French Ligue 1",
    "UEFA Europa League",
    "Indian Super League",
    "Australian A-League",
];

export const useSportsApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Helper to format a Date object or string as YYYY-MM-DD
     */
    const formatDate = useCallback((dateInput) => {
        const d = new Date(dateInput);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }, []);

    /**
     * Helper to format API UTC timestamp to user's local timezone (12h format)
     */
    const formatLocalTime = useCallback((utcTimestamp) => {
        if (!utcTimestamp) return "TBD";
        try {
            // Ensure UTC parsing by appending Z if the API missed it
            const dateStr = utcTimestamp.endsWith('Z') ? utcTimestamp : `${utcTimestamp}Z`;
            const date = new Date(dateStr);

            // Format to 12-hour local time like "8:40 PM"
            return new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            }).format(date);
        } catch (e) {
            return "TBD";
        }
    }, []);

    /**
     * Aggregator: Helper to search all popular leagues for a given date sequentially.
     * Sequential (not parallel) to avoid hitting TheSportsDB's free tier rate limiter,
     * which silently returns empty responses when too many requests fire at once.
     */
    const fetchTopMatchesByDate = useCallback(async (targetDateStr) => {
        setLoading(true);
        setError(null);
        const allMatches = [];
        try {
            for (const league of POPULAR_LEAGUES) {
                const queryParams = `${league}_${targetDateStr}`;
                const endpoint = `${API_BASE_URL}/searchfilename.php?e=${encodeURIComponent(queryParams)}`;

                try {
                    const response = await fetch(endpoint);
                    if (!response.ok) continue;
                    const text = await response.text();
                    if (!text || text.trim() === '') continue;
                    const data = JSON.parse(text);
                    if (!data.event) continue;

                    const leagueMatches = data.event.map(event => {
                        let matchStatus = "UPCOMING";
                        if (event.strStatus === "Match Finished" || event.strStatus === "FT") {
                            matchStatus = "FINISHED";
                        } else if (event.strStatus === "In Progress" || event.strStatus === "HT" || event.strStatus === "2H") {
                            matchStatus = "LIVE";
                        }

                        return {
                            id: `api_${event.idEvent}`,
                            team1: event.strHomeTeam,
                            team2: event.strAwayTeam,
                            team1Id: event.idHomeTeam,
                            team2Id: event.idAwayTeam,
                            team1Logo: event.strHomeTeamBadge || null,
                            team2Logo: event.strAwayTeamBadge || null,
                            league: event.strLeague,
                            time: formatLocalTime(event.strTimestamp),
                            date: event.dateEvent,
                            status: matchStatus,
                            category: 'Football',
                            isApiMatch: true,
                            homeScore: event.intHomeScore,
                            awayScore: event.intAwayScore,
                            thumb: event.strThumb
                        };
                    });
                    allMatches.push(...leagueMatches);
                } catch (e) {
                    // Silently skip this league on error
                }

                // Small delay between requests to respect rate limits (30 req/min free tier)
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            return allMatches;
        } catch (err) {
            console.error("API Aggregation Error:", err);
            setError("Failed to fetch matches for this date");
            return [];
        } finally {
            setLoading(false);
        }

    }, [formatLocalTime]);

    /**
     * Fetches all events happening today for a given sport category
     */
    const fetchTodaysMatches = useCallback(async (date = new Date(), sport = 'Soccer') => {
        if (sport !== 'Soccer') return [];
        return fetchTopMatchesByDate(formatDate(date));
    }, [fetchTopMatchesByDate, formatDate]);

    /**
     * Fetches all events happening tomorrow for a given sport category
     */
    const fetchTomorrowsMatches = useCallback(async (sport = 'Soccer') => {
        if (sport !== 'Soccer') return [];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return fetchTopMatchesByDate(formatDate(tomorrow));
    }, [fetchTopMatchesByDate]);

    /**
     * Advanced Search: Fetches matches for a specific date and league
     * Uses the searchfilename endpoint which is permitted on the free tier.
     * Format required by API: {League Name}_{YYYY-MM-DD}
     */
    const searchMatchByLeagueAndDate = useCallback(async (leagueName, dateString) => {
        setLoading(true);
        setError(null);
        try {
            const formattedDate = formatDate(dateString);

            // The API searchfilename expects format like: "English Premier League_2014-10-20"
            const queryParams = `${leagueName}_${formattedDate}`;
            const endpoint = `${API_BASE_URL}/searchfilename.php?e=${encodeURIComponent(queryParams)}`;

            const response = await fetch(endpoint);
            if (!response.ok) throw new Error('Failed to fetch from Sports API');

            const text = await response.text();
            if (!text || text.trim() === '') {
                console.warn('Sports API returned an empty response.');
                return [];
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('Sports API returned invalid JSON:', text);
                return [];
            }

            if (!data.event) {
                return [];
            }

            const formattedMatches = data.event.map(event => {
                let matchStatus = "UPCOMING";
                if (event.strStatus === "Match Finished" || event.strStatus === "FT") {
                    matchStatus = "FINISHED";
                } else if (event.strStatus === "In Progress" || event.strStatus === "HT" || event.strStatus === "2H") {
                    matchStatus = "LIVE";
                }

                return {
                    id: `api_${event.idEvent}`,
                    team1: event.strHomeTeam,
                    team2: event.strAwayTeam,
                    team1Id: event.idHomeTeam,
                    team2Id: event.idAwayTeam,
                    team1Logo: event.strHomeTeamBadge || null,
                    team2Logo: event.strAwayTeamBadge || null,
                    league: event.strLeague,
                    time: formatLocalTime(event.strTimestamp),
                    date: event.dateEvent,
                    status: matchStatus,
                    category: 'Football', // Assuming football for now
                    isApiMatch: true,
                    homeScore: event.intHomeScore,
                    awayScore: event.intAwayScore,
                    thumb: event.strThumb
                };
            });

            return formattedMatches;
        } catch (err) {
            console.error("API Search Error:", err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    return { fetchTodaysMatches, fetchTomorrowsMatches, searchMatchByLeagueAndDate, loading, error };
};
