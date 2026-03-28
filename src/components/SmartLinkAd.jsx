import React from 'react';
import { ExternalLink, PlayCircle } from 'lucide-react';

const SmartLinkAd = ({ link = "https://www.profitablecpmratenetwork.com/cwj89dgi?key=014a36262caac19cf719bef4a62809bf", label = "Watch in HD" }) => {
    return (
        <div className="w-full flex justify-center items-center my-6 px-4">
            <a 
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-full max-w-sm flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 px-6 rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                <PlayCircle className="w-6 h-6 animate-pulse" />
                <span className="relative z-10 text-lg tracking-wide uppercase">{label}</span>
                <ExternalLink className="w-5 h-5 ml-1 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
        </div>
    );
};

export default SmartLinkAd;
