import React, { useEffect, useRef } from 'react';

const AdBanner = () => {
  const adContainerRef = useRef(null);

  useEffect(() => {
    // Only run if the container exists and hasn't been populated yet
    if (adContainerRef.current && adContainerRef.current.childNodes.length === 0) {
      // Set options globally as some ad scripts expect this
      window.atOptions = {
        'key' : 'e6a4234b769abb757681ea0c40c89cbd',
        'format' : 'iframe',
        'height' : 50,
        'width' : 320,
        'params' : {}
      };

      const script = document.createElement('script');
      script.src = 'https://www.highperformanceformat.com/e6a4234b769abb757681ea0c40c89cbd/invoke.js';
      script.async = true;
      
      // Append to the container
      adContainerRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center my-8">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 tracking-widest uppercase mb-2">Advertisement</span>
      <div 
        ref={adContainerRef} 
        className="min-h-[50px] min-w-[320px] max-w-full overflow-hidden transition-all duration-300"
      >
        {/* The ad script will inject its iframe here */}
      </div>
    </div>
  );
};

export default AdBanner;
