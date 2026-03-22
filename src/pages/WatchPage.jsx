import React, { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import AdBanner from "../components/AdBanner"
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

function WatchPage() {
    const { id, serverIndex } = useParams()
    const navigate = useNavigate()
    const [match, setMatch] = useState(null)
    const [server, setServer] = useState(null)
    const [loading, setLoading] = useState(true)
    const videoRef = useRef(null)
    const playerWrapperRef = useRef(null)

    const [isPlaying, setIsPlaying] = useState(true)
    const [isMuted, setIsMuted] = useState(true)

    // Setup native video event listeners to keep custom buttons in sync
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);
        const handleVolumeChange = () => setIsMuted(video.muted || video.volume === 0);

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('volumechange', handleVolumeChange);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('volumechange', handleVolumeChange);
        }
    }, [server]) // Bind when component renders or server changes

    const togglePlay = () => {
        if (videoRef.current) {
            isPlaying ? videoRef.current.pause() : videoRef.current.play()
        }
    }

    const toggleMute = () => {
        if (videoRef.current) {
            videoRef.current.muted = !isMuted
            setIsMuted(!isMuted)
        }
    }

    const toggleFullScreen = async () => {
        const element = playerWrapperRef.current;
        if (element) {
            try {
                if (element.requestFullscreen) {
                    await element.requestFullscreen();
                } else if (element.webkitRequestFullscreen) {
                    await element.webkitRequestFullscreen();
                } else if (element.msRequestFullscreen) {
                    await element.msRequestFullscreen();
                }
                
                // Attempt to auto-rotate and lock to landscape on mobile
                if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
                    await window.screen.orientation.lock('landscape').catch(() => {
                        console.log("Orientation lock not supported or failed.");
                    });
                }
            } catch (error) {
                console.error("Error attempting full screen:", error);
            }
        }
    }

    // Automatically unlock screen orientation when user exits fullscreen mode
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreen = document.fullscreenElement || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement;
            if (!isFullscreen) {
                if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
                    window.screen.orientation.unlock();
                }
            }
        }

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        }
    }, [])

    // Setup HLS player when server changes
    useEffect(() => {
        if (!server || server.url.includes('<iframe')) return;

        const video = videoRef.current;
        if (!video) return;

        let hls;

        if (Hls.isSupported()) {
            hls = new Hls();
            hls.loadSource(server.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(e => console.log("Auto-play prevented", e));
            });
        }
        // Native HLS support (Safari)
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = server.url;
            video.addEventListener('loadedmetadata', function() {
                video.play().catch(e => console.log("Auto-play prevented", e));
            });
        }

        return () => {
            if (hls) {
                hls.destroy();
            }
        };
    }, [server])

    useEffect(() => {
        const fetchMatch = async () => {
            try {
                const docRef = doc(db, 'matches', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const matchData = { id: docSnap.id, ...docSnap.data() };
                    setMatch(matchData);
                    
                    const idx = parseInt(serverIndex, 10);
                    if (matchData.servers && matchData.servers[idx]) {
                        setServer(matchData.servers[idx]);
                    }
                }
            } catch (error) {
                console.error("Error fetching match:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatch();
    }, [id, serverIndex])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[60vh]">
                <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!match || !server) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Stream Not Found</h2>
                <button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-full transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in transition-colors duration-300">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-300">
                <div>
                    <Link to={`/link/${match.id}`} className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 font-medium mb-3 transition-colors group">
                        <svg className="w-4 h-4 mr-1 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Servers
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                        {match.team1} <span className="text-gray-400 dark:text-gray-500 font-normal italic px-2">vs</span> {match.team2}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                        Now Playing: {server.name}
                    </p>
                </div>
            </div>

            <AdBanner />

            {/* Video Player Area */}
            <div ref={playerWrapperRef} className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                {server.url.includes('<iframe') ? (
                    <div 
                        className="w-full aspect-video flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:aspect-video"
                        dangerouslySetInnerHTML={{ __html: server.url }}
                    />
                ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-black">
                        <video 
                            ref={videoRef}
                            className="w-full h-full outline-none" 
                            controls 
                            autoPlay 
                            muted
                        />
                    </div>
                )}
            </div>

            {/* Custom Video Controls */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 shadow-sm animate-fade-in">
                {!server.url.includes('<iframe') && (
                    <>
                        <button 
                            onClick={togglePlay}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95"
                        >
                            {isPlaying ? <><Pause size={20} /> Pause</> : <><Play size={20} /> Play</>}
                        </button>
                        
                        <button 
                            onClick={toggleMute}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700"
                        >
                            {isMuted ? <><VolumeX size={20} /> Unmute</> : <><Volume2 size={20} /> Mute</>}
                        </button>
                    </>
                )}

                <button 
                    onClick={toggleFullScreen}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white rounded-xl font-bold transition-all transform hover:scale-105 active:scale-95 border border-gray-200 dark:border-gray-700"
                >
                    <Maximize size={20} /> Full Screen
                </button>
            </div>
            
            <AdBanner />
        </div>
    )
}

export default WatchPage
