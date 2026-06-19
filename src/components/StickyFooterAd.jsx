import React, { useState } from 'react';
import AdBanner from './AdBanner';
import { X } from 'lucide-react';

const StickyFooterAd = () => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800 shadow-[0_-10px_30px_rgba(0,0,0,0.1)] flex justify-center items-center py-2 animate-slide-up sm:hidden">
            <button 
                onClick={() => setIsVisible(false)}
                className="absolute -top-3 right-2 bg-red-600 text-white rounded-full p-1 shadow-lg hover:bg-red-700 transition-colors"
                aria-label="Close Advertisement"
            >
                <X size={14} strokeWidth={3} />
            </button>
            <div className="relative">
                <AdBanner height={50} width={320} autoRefresh={true} refreshInterval={45000} />
            </div>
        </div>
    );
};

export default StickyFooterAd;
