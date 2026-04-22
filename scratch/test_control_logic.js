const testUrl1 = '<iframe width="560" height="315" src="https://www.youtube.com/embed/aqz-KE-bpKQ" frameborder="0"></iframe>';
const testUrl2 = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ';

const getIframeSrc = (html) => {
    const match = html.match(/src="([^"]+)"/);
    let src = match ? match[1] : "";
    
    if (src.includes('youtube.com') || src.includes('youtu.be') || src.includes('youtube-nocookie.com')) {
        const origin = "http://localhost:5173";
        src += (src.includes('?') ? '&' : '?') + `autoplay=1&mute=0&enablejsapi=1&api=1&controls=0&rel=0&origin=${encodeURIComponent(origin)}`;
    } else {
        return src || html; 
    }
    return src;
};

console.log('Result 1:', getIframeSrc(testUrl1));
console.log('Result 2:', getIframeSrc(testUrl2));
