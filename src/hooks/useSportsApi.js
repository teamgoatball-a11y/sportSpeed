import { useState, useCallback } from 'react';

// API-Football (api-sports.io) — free tier: 100 req/day
const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

const API_HEADERS = {
    'x-apisports-key': API_KEY,
};

// User's timezone for correct local time display
const TIMEZONE = 'Asia/Kolkata';

// Only show top leagues + international competitions (filter out lower divisions)
// API-Football league IDs: https://www.api-football.com/documentation-v3
const TOP_LEAGUE_IDS = new Set([
    // International
    1,    // World Cup
    4,    // Euro Championship
    10,   // International Friendlies
    29,   // World Cup Qualification - CONMEBOL
    30,   // World Cup Qualification - Africa
    31,   // World Cup Qualification - Asia
    32,   // World Cup Qualification - Europe
    33,   // World Cup Qualification - CONCACAF
    // UEFA Club
    2,    // UEFA Champions League
    3,    // UEFA Europa League
    848,  // UEFA Conference League
    // Top European Leagues
    39,   // English Premier League
    135,  // Italian Serie A
    140,  // Spanish La Liga
    61,   // French Ligue 1
    78,   // German Bundesliga
    94,   // Portuguese Primeira Liga
    88,   // Dutch Eredivisie
    203,  // Turkish Süper Lig
    144,  // Belgian Pro League
    179,  // Scottish Premiership
    // South America
    11,   // Copa Libertadores
    13,   // Copa Sudamericana
    71,   // Brazilian Série A
    128,  // Argentine Primera División
    // North America
    253,  // Major League Soccer (MLS)
    // Asia / India
    323,  // Indian Super League
    // Africa
    12,   // Africa Cup of Nations
]);


export const useSportsApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Helper: format a Date object as YYYY-MM-DD (local date)
     */
    const formatDate = useCallback((dateInput) => {
        const d = new Date(dateInput);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }, []);

    /**
     * Helper: format API UTC timestamp to local 12-hour time
     */
    const formatLocalTime = useCallback((utcTimestamp) => {
        if (!utcTimestamp) return 'TBD';
        try {
            const date = new Date(utcTimestamp);
            return new Intl.DateTimeFormat('default', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: TIMEZONE,
            }).format(date);
        } catch {
            return 'TBD';
        }
    }, []);

    /**
     * Core fetcher: get all fixtures for a given date string (YYYY-MM-DD)
     * ONE request returns ALL leagues — no looping needed!
     * @param {string} dateStr The date to fetch
     * @param {boolean} applyFilter Whether to filter down to TOP_LEAGUE_IDS (default true)
     */
    const fetchFixturesByDate = useCallback(async (dateStr, applyFilter = true) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(
                `${API_BASE_URL}/fixtures?date=${dateStr}&timezone=${TIMEZONE}`,
                { headers: API_HEADERS }
            );

            if (!response.ok) throw new Error('API request failed');

            const data = await response.json();

            if (data.errors && Object.keys(data.errors).length > 0) {
                throw new Error(Object.values(data.errors)[0]);
            }

            if (!data.response || data.response.length === 0) return [];

            // Filter to only top leagues & international competitions (if requested)
            const topFixtures = applyFilter
                ? data.response.filter(f => TOP_LEAGUE_IDS.has(f.league.id))
                : data.response;

            return topFixtures.map(fixture => {
                const { fixture: fix, teams, league, goals } = fixture;

                let status = 'UPCOMING';
                const s = fix.status?.short;
                if (['1H', '2H', 'HT', 'ET', 'P', 'LIVE'].includes(s)) status = 'LIVE';
                else if (['FT', 'AET', 'PEN'].includes(s)) status = 'FINISHED';

                return {
                    id: `api_${fix.id}`,
                    team1: teams.home.name,
                    team2: teams.away.name,
                    team1Logo: teams.home.logo || null,
                    team2Logo: teams.away.logo || null,
                    team1Id: teams.home.id,
                    team2Id: teams.away.id,
                    league: league.name,
                    leagueLogo: league.logo || null,
                    time: formatLocalTime(fix.date),
                    date: dateStr,
                    status,
                    category: 'Football',
                    isApiMatch: true,
                    homeScore: goals?.home ?? null,
                    awayScore: goals?.away ?? null,
                };
            });
        } catch (err) {
            console.error('API-Football Error:', err);
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, [formatLocalTime]);

    /**
     * Fetch today's fixtures — single API call, all leagues
     */
    const fetchTodaysMatches = useCallback(async () => {
        return fetchFixturesByDate(formatDate(new Date()));
    }, [fetchFixturesByDate, formatDate]);

    /**
     * Fetch tomorrow's fixtures — single API call, all leagues
     */
    const fetchTomorrowsMatches = useCallback(async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return fetchFixturesByDate(formatDate(tomorrow));
    }, [fetchFixturesByDate, formatDate]);

    /**
     * Advanced search: fixtures for a specific league + date
     * Now searches across ALL leagues on that date, ignoring the TOP_LEAGUE_IDS filter.
     */
    const searchMatchByLeagueAndDate = useCallback(async (leagueName, dateString) => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = formatDate(dateString);

            // Pass applyFilter = false to get ALL matches in the world for that date
            const allFixtures = await fetchFixturesByDate(dateStr, false);
            setLoading(false);

            if (!leagueName || leagueName.trim() === '') return allFixtures;

            // Filter by league name (case-insensitive partial match)
            const query = leagueName.toLowerCase();
            return allFixtures.filter(m =>
                m.league.toLowerCase().includes(query)
            );
        } catch (err) {
            console.error('Search Error:', err);
            setError(err.message);
            setLoading(false);
            return [];
        }
    }, [fetchFixturesByDate, formatDate]);

    return {
        fetchTodaysMatches,
        fetchTomorrowsMatches,
        searchMatchByLeagueAndDate,
        loading,
        error,
    };
};
