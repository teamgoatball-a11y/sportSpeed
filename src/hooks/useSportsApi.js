import { useState, useCallback } from 'react';

// API-Football (api-sports.io) — free tier: 100 req/day
const API_BASE_URL = 'https://v3.football.api-sports.io';
const API_KEY = import.meta.env.VITE_API_FOOTBALL_KEY;

const API_HEADERS = {
    'x-apisports-key': API_KEY,
};

// User's timezone for correct local time display
const TIMEZONE = 'Asia/Kolkata';

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
     */
    const fetchFixturesByDate = useCallback(async (dateStr) => {
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

            return data.response.map(fixture => {
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
     * Now searches by league name (filters from the full day's fixtures)
     */
    const searchMatchByLeagueAndDate = useCallback(async (leagueName, dateString) => {
        setLoading(true);
        setError(null);
        try {
            const dateStr = formatDate(dateString);
            const allFixtures = await fetchFixturesByDate(dateStr);
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
