import React, { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import AdBanner from "../components/AdBanner"
import SmartLinkAd from "../components/SmartLinkAd"
import MediumBanner from "../components/MediumBanner"
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'

function WatchPage() {
    const { id, serverIndex } = useParams()
    const [match, setMatch] = useState(null)
    const [server, setServer] = useState(null)
    const [loading, setLoading] = useState(true)
    const videoRef = useRef(null)
    const iframeRef = useRef(null)
    const playerWrapperRef = useRef(null)

    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);

    // Sync YouTube State
    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.data === 'string') {
                try {
                    const data = JSON.parse(event.data);
                    if (data.event === 'infoDelivery' && data.info) {
                        if (data.info.playerState !== undefined) {
                            setIsPaused(data.info.playerState === 2);
                        }
                    }
                } catch (e) {}
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Setup native video event listeners to keep custom buttons in sync
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handlePlay = () => setIsPaused(false);
        const handlePause = () => setIsPaused(true);
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
    // Robust YouTube ID extraction (handles links and iframe strings)
    const extractYoutubeId = (str) => {
        if (!str) return null;
        const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube-nocookie\.com\/embed\/)([^"&?\/\s]{11})/;
        const match = str.match(regex);
        return match ? match[1] : null;
    };

    const youtubeId = extractYoutubeId(server?.url);
    const isYoutube = !!youtubeId;

    const sendYTCommand = (func, args = "") => {
        if (iframeRef.current && isYoutube) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: func,
                args: args
            }), '*');
        }
    };

    const togglePlay = () => {
        if (isPaused) {
            sendYTCommand('playVideo');
        } else {
            sendYTCommand('pauseVideo');
        }
        
        if (videoRef.current) {
            isPaused ? videoRef.current.play() : videoRef.current.pause();
        }
        setIsPaused(!isPaused);
    };

    const toggleMute = () => {
        if (isMuted) {
            sendYTCommand('unMute');
            if (videoRef.current) videoRef.current.muted = false;
        } else {
            sendYTCommand('mute');
            if (videoRef.current) videoRef.current.muted = true;
        }
        setIsMuted(!isMuted);
    };

    // Helper to get controlled URL
    const getIframeSrc = (urlOrHtml) => {
        if (isYoutube) {
            const origin = window.location.origin;
            return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=0&enablejsapi=1&rel=0&controls=0&origin=${encodeURIComponent(origin)}`;
        }
        
        // Fallback for non-YouTube iframes: try to extract raw src or use original
        const match = urlOrHtml.match(/src=["']([^"']+)["']/);
        return match ? match[1] : urlOrHtml;
    };

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
        if (!server || server.url.includes('<iframe') || isYoutube) return;

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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-black shadow-sm transition-colors duration-300">
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
            <SmartLinkAd />

            {/* Video Player Area */}
            <div ref={playerWrapperRef} className="w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-black relative group">
                {isYoutube || server.url.includes('<iframe') ? (
                    <div className={`w-full aspect-video flex items-center justify-center ${isYoutube ? 'pointer-events-none' : 'pointer-events-auto'}`}>
                        <iframe 
                            key={server.url}
                            ref={iframeRef}
                            src={getIframeSrc(server.url)}
                            className="w-full h-full border-none"
                            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                            onLoad={() => {
                                if (isYoutube) {
                                    const win = iframeRef.current.contentWindow;
                                    win.postMessage(JSON.stringify({ event: 'listening' }), '*');
                                    win.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
                                }
                            }}
                        />
                    </div>
                ) : (
                    <div className="w-full aspect-video flex items-center justify-center bg-black pointer-events-auto">
                        <video 
                            ref={videoRef}
                            className="w-full h-full outline-none" 
                            controls={true}
                            autoPlay 
                            muted={isMuted}
                        />
                    </div>
                )}
            </div>

            {/* Premium Control Bar (Replicated from Highlights) */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 p-2 bg-white dark:bg-gray-900 rounded-3xl border border-black shadow-sm mx-2">
                <button 
                    onClick={togglePlay}
                    className="flex flex-col items-center justify-center h-14 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-[9px] uppercase tracking-tighter shadow-lg shadow-red-600/20"
                >
                    {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                    <span className="mt-1">{isPaused ? 'Play' : 'Pause'}</span>
                </button>
                
                <button 
                    onClick={toggleMute}
                    className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                >
                    {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    <span className="mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                <button 
                    onClick={toggleFullScreen}
                    className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                >
                    <Maximize size={18} />
                    <span className="mt-1">Full Screen</span>
                </button>
            </div>
            
            <AdBanner />
            <MediumBanner />
        </div>
    )
}

export default WatchPage
