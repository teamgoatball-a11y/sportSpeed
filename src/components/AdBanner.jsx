import React, { useEffect, useRef, useState } from 'react';

const AdBanner = ({ 
    adKey = 'e6a4234b769abb757681ea0c40c89cbd', 
    height = 50, 
    width = 320,
    autoRefresh = false,
    refreshInterval = 60000 // default 60 seconds
}) => {
    const wrapperRef = useRef(null);
    const bannerRef = useRef(null);
    const scriptLoaded = useRef(false);
    const [isVisible, setIsVisible] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    // Step 1: Watch for the banner to enter the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect(); // stop watching once visible
                }
            },
            { rootMargin: '150px' } // start loading 150px before it's visible
        );

        if (wrapperRef.current) {
            observer.observe(wrapperRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Step 2: Handle Auto Refresh
    useEffect(() => {
        if (!autoRefresh || !isVisible) return;
        
        const interval = setInterval(() => {
            // Clear the existing banner content
            if (bannerRef.current) {
                bannerRef.current.innerHTML = '';
            }
            scriptLoaded.current = false;
            setRefreshKey(prev => prev + 1);
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, isVisible, refreshInterval]);

    // Step 3: Inject scripts once visible (and on refresh)
    useEffect(() => {
        if (!isVisible || !bannerRef.current || scriptLoaded.current) return;

        const conf = document.createElement('script');
        const invoke = document.createElement('script');

        conf.innerHTML = `
            atOptions = {
                'key' : '${adKey}',
                'format' : 'iframe',
                'height' : ${height},
                'width' : ${width},
                'params' : {}
            };
        `;
        invoke.src = `https://www.highperformanceformat.com/${adKey}/invoke.js`;

        bannerRef.current.appendChild(conf);
        bannerRef.current.appendChild(invoke);
        scriptLoaded.current = true;
    }, [isVisible, adKey, height, width, refreshKey]);

    return (
        <div ref={wrapperRef} className="w-full flex flex-col items-center justify-center my-4">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase mb-2">Advertisement</span>
            <div
                key={refreshKey}
                ref={bannerRef}
                className="w-full max-w-full overflow-hidden flex justify-center items-center transition-all duration-300"
                style={{ minHeight: `${height}px` }}
            >
                {/* Ad loads here when scrolled into view */}
            </div>
        </div>
    );
};

export default AdBanner;
