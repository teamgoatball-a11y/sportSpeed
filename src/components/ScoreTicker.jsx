import React, { useState, useEffect, useRef } from 'react';

function ScoreTicker() {
    const [isVisible, setIsVisible] = useState(true);
    const containerRef = useRef(null);

    useEffect(() => {
        // We've moved the script to index.html for reliability.
        // This effect monitors if the widget actually renders anything.
        
        const timeout = setTimeout(() => {
            if (containerRef.current) {
                // Check if the script has injected anything (usually an iframe or div)
                const hasContent = containerRef.current.children.length > 0;
                if (!hasContent) {
                    console.log("ScoreTicker: Widget failed to load or no matches. Hiding bar.");
                    setIsVisible(false);
                }
            }
        }, 6000); // Wait 6 seconds for the script to do its job

        return () => clearTimeout(timeout);
    }, []);

    if (!isVisible) return null;

    return (
        <div className="bg-[#f00000] sticky top-0 z-[60] border-b border-red-700 shadow-md h-[40px] overflow-hidden flex items-center transition-all duration-500">
            {/* ScoreAxis Live Ticker Widget Container */}
            <div 
                ref={containerRef}
                className="scoreaxis-widget w-full" 
                data-widget="scoreaxis-ticker-live-score" 
                data-height="40px" 
                data-theme="dark" 
                data-font="Outfit"
                data-links="false"
                style={{ height: '40px', width: '100%' }}
            >
            </div>

            <style>{`
                .scoreaxis-widget {
                    font-family: 'Outfit', sans-serif !important;
                }
                .sa-widget-container {
                    background-color: transparent !important;
                }
            `}</style>
        </div>
    );
}

export default ScoreTicker;
