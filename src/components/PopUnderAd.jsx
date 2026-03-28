import React, { useEffect } from 'react';

const PopUnderAd = () => {
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://pl28917081.profitablecpmratenetwork.com/41/a7/d6/41a7d65c1760bc3852a2d6841dacdf2a.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null; // This component doesn't render anything visible
};

export default PopUnderAd;
