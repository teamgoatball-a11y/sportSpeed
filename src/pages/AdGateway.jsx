import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import MediumBanner from '../components/MediumBanner'
import SmartLinkAd from '../components/SmartLinkAd'
import AdBanner from '../components/AdBanner'

const COUNTDOWN_SECONDS = 2;

function AdGateway() {
    const { matchId, serverIndex } = useParams()
    const navigate = useNavigate()
    const [match, setMatch] = useState(null)
    const [server, setServer] = useState(null)
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const docRef = doc(db, 'matches', matchId)
                const docSnap = await getDoc(docRef)
                if (docSnap.exists()) {
                    const matchData = { id: docSnap.id, ...docSnap.data() }
                    setMatch(matchData)
                    const idx = parseInt(serverIndex, 10)
                    if (matchData.servers?.[idx]) {
                        setServer(matchData.servers[idx])
                    }
                }
            } catch (e) {
                console.error('AdGateway error:', e)
            }
        }
        fetchMatch()
    }, [matchId, serverIndex])

    // Start countdown only after server data is loaded
    useEffect(() => {
        if (!server) return

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setReady(true)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(timer)
    }, [server])

    const handleProceed = useCallback(() => {
        if (!server) return
        const isIframe = server.url?.includes('<iframe')
        const isM3u8 = server.url?.includes('.m3u8')
        const isWatchable = isIframe || isM3u8

        if (isWatchable) {
            navigate(`/watch/${matchId}/${serverIndex}`)
        } else {
            window.open(server.url, '_blank')
        }
    }, [server, matchId, serverIndex, navigate])

    const circumference = 2 * Math.PI * 36

    return (
        <div className="max-w-2xl mx-auto space-y-6 py-6 px-4 animate-fade-in">

            {/* Match Info Header */}
            {match && (
                <div className="text-center bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
                    <p className="text-xs text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Now Loading Stream</p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {match.team1} <span className="text-red-500 italic">vs</span> {match.team2}
                    </h1>
                    {server && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                            {server.name}
                        </p>
                    )}
                </div>
            )}

            {/* Ads shown during countdown */}
            <AdBanner />
            <SmartLinkAd />
            <MediumBanner />

            {/* Countdown / Watch Button */}
            <div className="flex flex-col items-center gap-4 py-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
                {!ready ? (
                    <>
                        {/* Circular countdown ring */}
                        <div className="relative w-24 h-24">
                            <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r="36" fill="none" stroke="#1f2937" strokeWidth="6" />
                                <circle
                                    cx="40" cy="40" r="36"
                                    fill="none"
                                    stroke="#ef4444"
                                    strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray={circumference}
                                    strokeDashoffset={circumference * (1 - countdown / COUNTDOWN_SECONDS)}
                                    className="transition-all duration-1000 ease-linear"
                                />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-3xl font-black text-white">{countdown}</span>
                        </div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Your stream will be ready in <strong className="text-white">{countdown}s</strong></p>
                    </>
                ) : (
                    <button
                        onClick={handleProceed}
                        className="px-10 py-4 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-bold text-lg rounded-full shadow-lg shadow-red-600/40 transform hover:-translate-y-1 transition-all duration-300 animate-pulse"
                    >
                        ▶ Watch Now
                    </button>
                )}

                <Link
                    to={`/link/${matchId}`}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors mt-2"
                >
                    ← Back to server list
                </Link>
            </div>

        </div>
    )
}

export default AdGateway
