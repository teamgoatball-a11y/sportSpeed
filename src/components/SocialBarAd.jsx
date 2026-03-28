import React, { useEffect } from 'react';

const SocialBarAd = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pl29003857.profitablecpmratenetwork.com/7b/11/b7/7b11b7485dbca89781240a57f989b887.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            // Clean up when the component is unmounted
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    return null; // This component doesn't render anything visible in the standard React flow
};

export default SocialBarAd;
