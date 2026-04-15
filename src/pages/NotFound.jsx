import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 animate-fade-in">
            <div className="relative mb-8">
                <span className="text-9xl font-black text-gray-100 dark:text-gray-900 select-none">404</span>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter italic">
                        GOAT<span className="text-red-600">BALL</span>
                    </span>
                </div>
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tight">
                Offside! Match Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 font-medium">
                The page you are looking for has been moved, deleted, or never existed in the first place. Let's get you back to the action.
            </p>
            
            <Link 
                to="/" 
                className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-300 bg-red-600 rounded-full hover:bg-red-700 shadow-xl shadow-red-600/30 hover:shadow-red-600/40 transform hover:-translate-y-1"
            >
                <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to Match Center
            </Link>
        </div>
    );
}

export default NotFound;
