import React, { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import AdBanner from "../components/AdBanner"

function LinkPage() {
    const { id } = useParams()
    const [match, setMatch] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const docRef = doc(db, 'matches', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setMatch({ id: docSnap.id, ...docSnap.data() });
                }
            } catch (error) {
                console.error("Error fetching match:", error);
            } finally {
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

    if (!match) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Match Not Found</h2>
                <Link to="/" className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
                    Return Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 animate-fade-in transition-colors duration-300">

            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
                <div>
                    <Link to={`/match/${match.id}`} className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium mb-3 transition-colors group">
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Match Details
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                        {match.team1} <span className="text-gray-400 dark:text-gray-500 font-normal italic px-2">vs</span> {match.team2}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors duration-300">Available Streaming Servers</p>
                </div>
            
            
                {/* Status indicator */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 rounded-full border border-green-200 dark:border-green-500/20 w-fit">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-green-700 dark:text-green-500 text-xs font-bold tracking-wide">SERVERS ONLINE</span>
                </div>
            </div>

            {/* Ad Banner */}
            <AdBanner />
              <AdBanner />

            {/* Servers List */}
            {match.servers && match.servers.filter(s => s.name?.trim() || s.url?.trim()).length > 0 ? (
                <div className="space-y-4">
                    {match.servers.filter(s => s.name?.trim() || s.url?.trim()).map((server, index) => {
                        // Mocking different qualities and pings for visual variety
                        const quality = index === 0 ? '1080p60' : index === 1 ? '1080p' : '720p';
                        const ping = index === 0 ? '12ms' : index === 1 ? '24ms' : '45ms';
                        const isBest = index === 0;

                        return (
                            <a
                                key={server.name}
                                href={server.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`block group relative overflow-hidden rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 ${isBest
                                    ? 'bg-red-50 dark:bg-gray-900 border-red-200 dark:border-red-900/50 hover:border-red-400 dark:hover:border-red-500 shadow-md shadow-red-100 dark:shadow-red-900/20'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-600 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                {/* Best Server Badge */}
                                {isBest && (
                                    <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg tracking-wider z-10">
                                        RECOMMENDED
                                    </div>
                                )}

                                <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">

                                    {/* Play Icon Area */}
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${isBest
                                        ? 'bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-500 group-hover:bg-red-600 group-hover:text-white'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 group-hover:text-gray-900 dark:group-hover:text-white'
                                        }`}>
                                        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>

                                    {/* Server Info */}
                                    <div className="flex-1 text-center sm:text-left">
                                        <h3 className={`text-lg font-bold mb-1 transition-colors duration-300 ${isBest ? 'text-gray-900 dark:text-white' : 'text-gray-800 dark:text-gray-200'
                                            }`}>
                                            {server.name}
                                        </h3>
                                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2 sm:mt-0">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md transition-colors duration-300">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                {quality}
                                            </span>
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md transition-colors duration-300">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                                {ping} ping
                                            </span>
                                        </div>
                                    </div>

                                    {/* Action arrow */}
                                    <div className="hidden sm:flex items-center text-gray-400 dark:text-gray-600 group-hover:text-red-500 transition-colors transform group-hover:translate-x-1">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg> 
                                    </div>
                              
                                </div>
                               
                            </a>
                        );
                    })}
                    <AdBanner />
                </div>
                
            ) : (
                <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center transition-colors duration-300">
                    <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-700 mb-4 transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Servers Starting Up</h3>
                    <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">Links will be populated automatically when the match is closer to kick-off.</p>
                
                </div>
            )}

        </div>
    )
}

export default LinkPage