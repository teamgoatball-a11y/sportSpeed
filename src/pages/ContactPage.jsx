import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, Send } from 'lucide-react';
import { siteSettings } from '../config/siteSettings';

function ContactPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-16 sm:py-24 animate-fade-in">
            <Helmet>
                <title>Contact Us | {siteSettings.name}</title>
                <meta name="description" content={`Contact ${siteSettings.name} for feedback, collaboration, and business enquiries.`} />
            </Helmet>

            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4 font-display italic">
                    Get in <span className="text-red-600">Touch</span>
                </h1>
                <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-xl mx-auto">
                    We'd love to hear from you! Whether you have feedback, want to collaborate, or have business enquiries.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                {/* Email Option */}
                <a 
                    href={`mailto:${siteSettings.contactEmail}`} 
                    className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden group hover:border-red-500/50 hover:shadow-red-600/10 transition-all flex flex-col items-center justify-center text-center transform hover:-translate-y-1"
                >
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Mail size={32} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">{siteSettings.contactEmail}</p>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-500">Send an Email &rarr;</span>
                </a>

                {/* Telegram Option */}
                <a 
                    href="https://t.me/niyasHussain10" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white dark:bg-gray-900 rounded-[2rem] p-8 border border-gray-200 dark:border-gray-800 shadow-lg relative overflow-hidden group hover:border-blue-500/50 hover:shadow-blue-500/10 transition-all flex flex-col items-center justify-center text-center transform hover:-translate-y-1"
                >
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        {/* Telegram Icon */}
                        <Send size={32} className="-ml-1 mt-1" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tight">Telegram</h3>
                    <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">Direct Message</p>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-500 dark:text-blue-400">Message Now &rarr;</span>
                </a>
            </div>
        </div>
    );
}

export default ContactPage;
