import React, { useState, useEffect, useRef } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Helmet } from 'react-helmet-async'
import { siteSettings } from '../config/siteSettings'
import AdBanner from "../components/AdBanner"
import SmartLinkAd from "../components/SmartLinkAd"
import MediumBanner from "../components/MediumBanner"
import Hls from 'hls.js'
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react'
import WhatsAppPrompt from "../components/WhatsAppPrompt"
import { useSettings } from "../hooks/useSettings"

function WatchPage() {
    const { id, serverIndex } = useParams()
    const navigate = useNavigate()
    const { settings } = useSettings()
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
            hls = new Hls({
                debug: false,
            });
            hls.loadSource(server.url);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                video.play().catch(e => console.log("Auto-play prevented", e));
            });
            
            // Add Error Handling
            hls.on(Hls.Events.ERROR, function (event, data) {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error("HLS Network Error: This is usually caused by CORS (Cross-Origin Resource Sharing) restrictions on the streaming server, or Mixed Content (HTTP vs HTTPS).", data);
                            hls.startLoad(); // Try to recover
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error("HLS Media Error", data);
                            hls.recoverMediaError(); // Try to recover
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
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
            <Helmet>
                <title>Watching {match.team1} vs {match.team2} Live | {siteSettings.name}</title>
                <meta name="description" content={`Watching ${match.team1} vs ${match.team2} live stream on ${siteSettings.name}.`} />
            </Helmet>
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
            <AdBanner autoRefresh={true} refreshInterval={60000} />
            <WhatsAppPrompt />

            <AdBanner autoRefresh={true} refreshInterval={60000} />
            <SmartLinkAd />

            {/* Live Streaming Load Notice */}
            <div className="mx-2 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-500 text-xs sm:text-sm font-black uppercase tracking-wider animate-pulse">
                <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                <span>Please wait 20 seconds to load the live streaming.</span>
            </div>

            {/* Video Player Area */}
            <div ref={playerWrapperRef} className="w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl border border-black relative group">
                {(server.url?.includes('<iframe') || server.url?.includes('.m3u8')) && !isYoutube && (
                    <div className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-20 pointer-events-none select-none opacity-60">
                        <span className="text-white font-black text-xl sm:text-2xl tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                            {siteSettings.isSportSpeed ? (
                                <>SPORT<span className="text-red-600">SPEED</span>.online</>
                            ) : (
                                <>GOAT<span className="text-red-600">BALL</span>.online</>
                            )}
                        </span>
                    </div>
                )}
                {settings?.channelLink && (
                    <a 
                        href={settings.channelLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-full shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all transform hover:-translate-y-0.5 border border-emerald-400"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                        </svg>
                        Join Channel
                    </a>
                )}
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
            
            {settings?.channelLink && (
                <div className="mx-2">
                    <a 
                        href={settings.channelLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-black uppercase tracking-wider rounded-2xl shadow-lg hover:shadow-emerald-500/20 border border-emerald-400 transition-all transform hover:-translate-y-0.5 text-center text-xs sm:text-sm"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                        </svg>
                        Join Our Official WhatsApp Channel
                    </a>
                </div>
            )}
            
            <AdBanner autoRefresh={true} refreshInterval={60000} />
            <MediumBanner />
              <MediumBanner />
        </div>
    )
}

export default WatchPage
