import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Helmet } from 'react-helmet-async';
import { siteSettings } from '../config/siteSettings';
import HighlightCard from '../components/HighlightCard';
import { ArrowLeft, Share2, Trophy, Play, Pause, Volume2, VolumeX, Maximize, Loader2, RotateCcw, RotateCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSettings } from '../hooks/useSettings';

function HighlightPlayerPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { settings } = useSettings();
    const [currentHighlight, setCurrentHighlight] = useState(null);
    const [others, setOthers] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Player State
    const [isPaused, setIsPaused] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const playerRef = useRef(null);
    const containerRef = useRef(null);

    // Helper: Format seconds to MM:SS
    const formatTime = (seconds) => {
        if (!seconds) return "00:00";
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        if (h > 0) {
            return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        }
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        const fetchHighlight = async () => {
            setLoading(true);
            try {
                const q = query(collection(db, 'highlights'), where('slug', '==', slug), limit(1));
                const snap = await getDocs(q);
                
                if (!snap.empty) {
                    const data = snap.docs[0].data();
                    setCurrentHighlight({ id: snap.docs[0].id, ...data });
                    document.title = `${data.title} - Highlights | ${siteSettings.name.toUpperCase()}`;
                } else {
                    toast.error("Highlight not found");
                    navigate('/highlights');
                }
            } catch (error) {
                console.error(error);
                toast.error("Error loading video");
            } finally {
                setLoading(false);
            }
        };

        fetchHighlight();
        return () => { document.title = siteSettings.name.toUpperCase(); };
    }, [slug, navigate]);

    useEffect(() => {
        const fetchOthers = async () => {
            try {
                const q = query(collection(db, 'highlights'), orderBy('createdAt', 'desc'), limit(5));
                const snapshot = await getDocs(q);
                setOthers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).filter(h => h.slug !== slug));
            } catch (error) {
                console.error("Error loading other highlights:", error);
            }
        };
        fetchOthers();
    }, [slug]);

    // Handle YouTube PostMessages (Time Tracking)
    useEffect(() => {
        const handleMessage = (event) => {
            if (typeof event.data === 'string') {
                try {
                    const data = JSON.parse(event.data);
                    // YouTube sends state and time updates via infoDelivery
                    if (data.event === 'infoDelivery' && data.info) {
                        if (data.info.currentTime !== undefined) {
                            setCurrentTime(data.info.currentTime);
                        }
                        if (data.info.duration !== undefined) {
                            setDuration(data.info.duration);
                        }
                        if (data.info.playerState !== undefined) {
                            // 1 = playing, 2 = paused
                            setIsPaused(data.info.playerState === 2);
                        }
                    }
                } catch (e) {}
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const sendYTCommand = (func, args = "") => {
        const isYoutube = currentHighlight.type === 'youtube' || (currentHighlight.youtubeId && !currentHighlight.embedHtml);
        if (playerRef.current && isYoutube) {
            playerRef.current.contentWindow.postMessage(JSON.stringify({
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
        setIsPaused(!isPaused);
    };

    const toggleMute = () => {
        if (isMuted) {
            sendYTCommand('unMute');
        } else {
            sendYTCommand('mute');
        }
        setIsMuted(!isMuted);
    };

    const handleSeek = (offset) => {
        sendYTCommand('seekTo', [currentTime + offset, true]);
        toast.success(offset > 0 ? `+${offset}s` : `${offset}s`, { duration: 800 });
    };

    const handleFullscreen = () => {
        if (containerRef.current.requestFullscreen) {
            containerRef.current.requestFullscreen();
        } else if (containerRef.current.webkitRequestFullscreen) {
            containerRef.current.webkitRequestFullscreen();
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Preparing Theatre...</p>
            </div>
        );
    }

    if (!currentHighlight) return null;

    const isYoutube = currentHighlight.type === 'youtube' || (currentHighlight.youtubeId && !currentHighlight.embedHtml);

    const youtubeUrl = isYoutube 
        ? `https://www.youtube.com/embed/${currentHighlight.youtubeId}?autoplay=1&mute=0&enablejsapi=1&rel=0&controls=0`
        : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            <Helmet>
                <title>{currentHighlight.title} - Video Highlights | {siteSettings.name}</title>
                <meta name="description" content={currentHighlight.description?.substring(0, 150) || `Watch ${currentHighlight.title} highlights on ${siteSettings.name}.`} />
            </Helmet>
            {/* Header / Meta */}
            <div className="mb-6 flex items-center justify-between">
                <Link to="/highlights" className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold uppercase text-[10px] tracking-widest transition-colors group">
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back
                </Link>
                <button onClick={handleShare} className="flex items-center gap-2 p-2 px-4 rounded-full border border-black text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-[10px] font-black uppercase tracking-widest">
                    <Share2 size={12} /> Share
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                
                {/* Main Player */}
                <div className="lg:col-span-2 space-y-4">
                    <div ref={containerRef} className="bg-black rounded-[2rem] overflow-hidden shadow-2xl relative group border border-black">
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
                        {/* Watermark for non-YouTube embeds */}
                        {!isYoutube && (
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
                        {/* Video Layer - Pointer Events None to disable native interactions */}
                        <div className="aspect-video w-full flex items-center justify-center pointer-events-none">
                            {isYoutube ? (
                                <iframe 
                                    ref={playerRef}
                                    width="100%" height="100%" 
                                    src={youtubeUrl}
                                    title={currentHighlight.title}
                                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                    onLoad={() => {
                                        // Initialize listening for YT events and force unmute
                                        const win = playerRef.current.contentWindow;
                                        win.postMessage(JSON.stringify({ event: 'listening' }), '*');
                                        win.postMessage(JSON.stringify({ event: 'command', func: 'unMute', args: '' }), '*');
                                    }}
                                ></iframe>
                            ) : (
                                <div 
                                    className="w-full h-full custom-embed-container"
                                    dangerouslySetInnerHTML={{ __html: currentHighlight.embedHtml }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Progress Bar and Timestamps */}
                    <div className="px-6 space-y-2">
                        <div className="flex justify-between items-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-red-600 transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                                style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Premium Control Bar */}
                    <div className="grid grid-cols-5 gap-2 sm:gap-4 p-2 bg-white dark:bg-gray-900 rounded-3xl border border-black shadow-sm mx-2">
                        {/* Step Back */}
                        <button 
                            onClick={() => handleSeek(-10)}
                            className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                        >
                            <RotateCcw size={16} />
                            <span className="mt-1">-10s</span>
                        </button>

                        {/* Play / Pause */}
                        <button 
                            onClick={togglePlay}
                            className="flex flex-col items-center justify-center h-14 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black text-[9px] uppercase tracking-tighter shadow-lg shadow-red-600/20"
                        >
                            {isPaused ? <Play size={20} fill="currentColor" /> : <Pause size={20} fill="currentColor" />}
                            <span className="mt-1">{isPaused ? 'Play' : 'Pause'}</span>
                        </button>
                        
                        {/* Step Forward */}
                        <button 
                            onClick={() => handleSeek(10)}
                            className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                        >
                            <RotateCw size={16} />
                            <span className="mt-1">+10s</span>
                        </button>

                        {/* Mute */}
                        <button 
                            onClick={toggleMute}
                            className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                        >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                            <span className="mt-1">{isMuted ? 'Unmute' : 'Mute'}</span>
                        </button>

                        {/* Full Screen */}
                        <button 
                            onClick={handleFullscreen}
                            className="flex flex-col items-center justify-center h-14 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-black text-[9px] uppercase tracking-tighter"
                        >
                            <Maximize size={18} />
                            <span className="mt-1">Full</span>
                        </button>
                    </div>

                    {settings?.channelLink && (
                        <div className="mx-2 mt-4">
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

                    {/* Info */}
                    <div className="p-4 sm:p-2 space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-red-50 dark:bg-red-500/5 text-red-600 dark:text-red-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-black">
                                <Trophy size={10} className="inline mr-1" /> {currentHighlight.competition}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-white italic tracking-tighter uppercase leading-none font-display">
                            {currentHighlight.title}
                        </h1>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Up Next</h2>
                    <div className="grid grid-cols-1 gap-6">
                        {others.map((h) => (
                            <HighlightCard key={h.id} highlight={h} />
                        ))}
                    </div>
                </div>

            </div>

            <style>{`
                .custom-embed-container iframe {
                    width: 100% !important;
                    height: 100% !important;
                    border: none !important;
                }
            `}</style>
        </div>
    );
}

export default HighlightPlayerPage;
