import React, { useEffect } from 'react';

/**
 * MonetagAd Component
 * 
 * A clean, reusable component to safely inject Monetag scripts (like Vignette or In-Page Push).
 * It dynamically adds the script to the document and ensures it is cleaned up if the component unmounts.
 * This makes it very easy to turn on/off or remove entirely without leaving leftover code.
 * 
 * @param {string} scriptUrl - The Monetag script URL (e.g., "//alwingulla.com/88/tag.min.js")
 * @param {string} zoneId - Your Monetag Zone ID (e.g., "7891011")
 */
const MonetagAd = ({ scriptUrl, zoneId }) => {
    useEffect(() => {
        if (!scriptUrl || !zoneId) return;

        // Create the script element
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.setAttribute('data-zone', zoneId);
        script.setAttribute('data-cfasync', 'false');
        script.async = true;

        // Append to document body
        document.body.appendChild(script);

        // Cleanup function: removes the script when the component unmounts
        // This ensures no memory leaks and easy removal if you stop using Monetag
        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [scriptUrl, zoneId]);

    // Monetag vignette/pop scripts don't render visible UI, so we return null
    return null;
};

export default MonetagAd;
