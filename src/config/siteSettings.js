/**
 * Global site settings and configuration.
 * Centralizing these values makes it easier to update brand info, social links, and SEO defaults.
 */

// Determine brand at runtime
const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
// Check environment variable first, then fallback to hostname check
const isSportSpeedEnv = import.meta.env.VITE_SITE_BRAND === 'sportspeed';
const isSportSpeedHost = hostname.includes('sportspeed');
export const isSportSpeed = isSportSpeedEnv || isSportSpeedHost;

const commonPoll = {
    id: 'poll-01',
    question: 'Who will win the upcoming European Championship?',
    options: [
        { label: 'England', value: 'england' },
        { label: 'France', value: 'france' },
        { label: 'Germany', value: 'germany' },
        { label: 'Spain', value: 'spain' }
    ]
};

const goatBallSettings = {
    brand: 'goatball',
    name: 'GoatBall',
    whatsappLink: '',
    channelLink: '',
    tagline: 'Stream Live Football, Cricket & World Cup Anytime, Anywhere',
    description: 'GoatBall is your ultimate destination for live football streaming, live cricket, World Cup coverage, news, and match highlights. Follow your favorite teams and never miss a goal or wicket.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://goatball.online',
    domain: 'goatball.online',
    contactEmail: 'teamgoatball@gmail.com',
    logo: '/logo.png',
    social: {
        facebook: {
            url: 'https://facebook.com/goatball',
            fans: '2,530 Fans'
        },
        twitter: {
            url: 'https://twitter.com/goatball',
            fans: '2,046 Fans'
        },
        youtube: {
            url: 'https://youtube.com/c/goatball',
            fans: '1,170 Fans'
        },
        instagram: {
            url: 'https://instagram.com/goatball',
            fans: '5.2k Followers'
        }
    },
    seo: {
        defaultTitle: 'GoatBall - Live Football, Cricket & World Cup 2026',
        titleTemplate: '%s | GoatBall',
        defaultDescription: 'Watch the FIFA World Cup 2026, Football, and Cricket live in HD! Free sports streaming. Get the latest match previews, scores, and highlights.',
        keywords: 'world cup 2026 live stream, free football streaming, live cricket streaming, IPL live, watch world cup free, soccer streams, live sports, cricket live, match highlights, goatball',
    },
    activePoll: commonPoll
};

const sportSpeedSettings = {
    brand: 'sportspeed',
    name: 'SportSpeed',
    whatsappLink: '',
    channelLink: '',
    tagline: 'Stream Live Football, Cricket & World Cup with Sports Speed',
    description: 'SportSpeed is your ultimate destination for live football streaming, live cricket, World Cup coverage, news, and match highlights. Follow your favorite teams at maximum speed.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://sportspeed.online',
    domain: 'sportspeed.online',
    contactEmail: 'teamsportspeed@gmail.com',
    logo: '/logo.png',
    social: {
        facebook: {
            url: 'https://facebook.com/sportspeed',
            fans: '2,530 Fans'
        },
        twitter: {
            url: 'https://twitter.com/sportspeed',
            fans: '2,046 Fans'
        },
        youtube: {
            url: 'https://youtube.com/c/sportspeed',
            fans: '1,170 Fans'
        },
        instagram: {
            url: 'https://instagram.com/sportspeed',
            fans: '5.2k Followers'
        }
    },
    seo: {
        defaultTitle: 'SportSpeed - Live Football, Cricket & World Cup 2026',
        titleTemplate: '%s | SportSpeed',
        defaultDescription: 'Watch the FIFA World Cup 2026, Football, and Cricket live in HD! Free sports streaming. Get the latest match previews, scores, and highlights at SportSpeed.',
        keywords: 'world cup 2026 live stream, free football streaming, live cricket streaming, IPL live, watch world cup free, soccer streams, live sports, cricket live, match highlights, sportspeed',
    },
    activePoll: commonPoll
};

export const siteSettings = isSportSpeed 
    ? { ...sportSpeedSettings, isSportSpeed: true }
    : { ...goatBallSettings, isSportSpeed: false };

export default siteSettings;
