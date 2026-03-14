import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'
import { db } from '../config/firebase'
import AdBanner from "../components/AdBanner"

function MatchPage() {
    const { id } = useParams()
    const [match, setMatch] = useState(null)
    const [loading, setLoading] = useState(true)
    const [currentTime, setCurrentTime] = useState(new Date())

    // Update current time every minute to evaluate if match naturally becomes LIVE
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const docRef = doc(db, 'matches', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setMatch({ id: docSnap.id, ...docSnap.data() });
                    // Show the page immediately — don't wait for the view counter write
                    setLoading(false);

                    // Fire-and-forget: increment view counter in background
                    updateDoc(docRef, { views: increment(1) }).catch(() => { });
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching match:", error);
                setLoading(false);
            }
        };

        fetchMatch();
    }, [id])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!match) return <div className="p-8 text-center text-red-500 font-medium bg-red-50 dark:bg-red-500/10 rounded-2xl border border-red-200 dark:border-red-500/20 max-w-2xl mx-auto mt-10">Match not found</div>

    const getEffectiveStatus = (m) => {
        if (!m) return 'UPCOMING';
        if (m.status === 'LIVE' || m.status === 'FINISHED') return m.status;
        if (!m.time || m.time === 'TBD') return m.status;

        try {
            const now = currentTime;
            let kickOff = new Date(`${now.toDateString()} ${m.time}`);
            if (isNaN(kickOff.getTime())) return m.status;

            const msSinceKickOff = now.getTime() - kickOff.getTime();
            if (msSinceKickOff > 0 && msSinceKickOff < 2 * 60 * 60 * 1000) {
                return 'LIVE';
            }
            if (msSinceKickOff >= 2 * 60 * 60 * 1000) {
                return 'FINISHED';
            }
            return 'UPCOMING';
        } catch {
            return m.status;
        }
    };

    const isLive = getEffectiveStatus(match) === "LIVE";

    return (
        <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 animate-fade-in transition-colors duration-300">

            {/* Back Navigation */}
            <div className="pt-2 px-4 sm:px-0">
                <Link to="/" className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors group">
                    <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="font-medium">Back to Matches</span>
                </Link>
            </div>

            {/* Hero Banner Area */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-2xl relative overflow-hidden transition-colors duration-300">

                {/* Dynamic Background Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-500/5 via-transparent to-red-500/5 dark:from-red-500/10 dark:via-transparent dark:to-orange-500/5 z-0"></div>

                <div className="relative z-10 flex flex-col items-center">

                    {/* Status Badge */}
                    <div className="mb-8">
                        {isLive ? (
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 dark:bg-red-500/20 rounded-full border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                </span>
                                <span className="text-red-600 dark:text-red-500 font-bold tracking-widest text-sm">LIVE NOW</span>
                            </div>
                        ) : (
                            <span className="px-4 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 font-bold tracking-widest text-sm rounded-full border border-gray-200 dark:border-gray-700">
                                UPCOMING
                            </span>
                        )}
                    </div>

                    {/* Teams Display */}
                    <div className="flex items-center justify-between w-full max-w-2xl gap-4 sm:gap-8">

                        {/* Team 1 */}
                        <div className="flex-1 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mb-4 border-2 border-gray-200 dark:border-gray-700/50 group-hover:border-red-500/50 dark:group-hover:border-red-500 transition-colors shadow-lg overflow-hidden">
                                {match.team1Logo ? (
                                    <img src={match.team1Logo} alt={match.team1} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-md" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <span className={`text-3xl font-black text-gray-800 dark:text-gray-200 ${match.team1Logo ? 'hidden' : 'flex'}`}>{match.team1.substring(0, 3).toUpperCase()}</span>
                            </div>
                            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{match.team1}</h2>
                        </div>

                        {/* VS Divider */}
                        <div className="flex flex-col items-center justify-center -mt-8">
                            <span className="text-gray-300 dark:text-gray-600 font-black italic text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-gray-400 to-gray-200 dark:from-gray-500 dark:to-gray-700">VS</span>
                        </div>

                        {/* Team 2 */}
                        <div className="flex-1 flex flex-col items-center text-center group">
                            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center mb-4 border-2 border-gray-200 dark:border-gray-700/50 group-hover:border-red-500/50 dark:group-hover:border-red-500 transition-colors shadow-lg overflow-hidden">
                                {match.team2Logo ? (
                                    <img src={match.team2Logo} alt={match.team2} className="w-14 h-14 sm:w-20 sm:h-20 object-contain drop-shadow-md" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                ) : null}
                                <span className={`text-3xl font-black text-gray-800 dark:text-gray-200 ${match.team2Logo ? 'hidden' : 'flex'}`}>{match.team2.substring(0, 3).toUpperCase()}</span>
                            </div>
                            <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{match.team2}</h2>
                        </div>

                    </div>


                </div>
            </div>

            {/* Match Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {/* Detail Card 1: League */}
                <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 text-center transition-colors duration-300">
                    <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">League</p>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{match.league}</p>
                </div>
                   <AdBanner />
                {/* Detail Card 2: Time */}
                <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 text-center transition-colors duration-300">
                    <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Kick-off Time</p>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{match.time}</p>
                </div>
                <AdBanner />
                {/* Detail Card 3: Venue */}
                <div className="bg-white/60 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 border border-gray-200/50 dark:border-gray-800/50 text-center transition-colors duration-300">
                    <div className="w-10 h-10 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Venue</p>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{match.venue || "Stadium"}</p>
                </div>

            </div>

            {/* Ad Banner */}
            <AdBanner />

            {/* Main Action Area */}
            <div className="text-center pt-8 pb-12">
                {isLive ? (
                    <Link
                        to={`/link/${match.id}`}
                        className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-lg rounded-full shadow-lg shadow-red-600/30 hover:shadow-red-500/40 transform hover:-translate-y-1 transition-all duration-300 ring-2 ring-transparent focus:ring-red-400 outline-none"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                        </svg>
                        Watch Live Stream Now
                    </Link>
                ) : (
                    <div className="inline-block p-6 rounded-2xl bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-colors duration-300">
                        <svg className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-1 transition-colors duration-300">Match hasn't started yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-300">Streaming links will be available 15 minutes before kick-off.</p>
                    </div>
                )}
            </div>

        </div>
    )
}

export default MatchPage