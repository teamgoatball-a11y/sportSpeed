/**
 * Global site settings and configuration.
 * Centralizing these values makes it easier to update brand info, social links, and SEO defaults.
 */

export const siteSettings = {
    name: 'GoatBall',
    tagline: 'Stream Live Football, Cricket & World Cup Anytime, Anywhere',
    description: 'GoatBall is your ultimate destination for live football streaming, live cricket, World Cup coverage, news, and match highlights. Follow your favorite teams and never miss a goal or wicket.',
    url: window.location.origin,
    logo: '/logo.png', // Update with actual paths
    
    // Social Links
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
    
    // SEO Defaults
    seo: {
        defaultTitle: 'GoatBall - Live Football, Cricket & World Cup 2026',
        titleTemplate: '%s | GoatBall',
        defaultDescription: 'Watch the FIFA World Cup 2026, Football, and Cricket live in HD! Free sports streaming. Get the latest match previews, scores, and highlights.',
        keywords: 'world cup 2026 live stream, free football streaming, live cricket streaming, IPL live, watch world cup free, soccer streams, live sports, cricket live, match highlights, goatball',
    },
    
    // Poll Mockup Data
    activePoll: {
        id: 'poll-01',
        question: 'Who will win the upcoming European Championship?',
        options: [
            { label: 'England', value: 'england' },
            { label: 'France', value: 'france' },
            { label: 'Germany', value: 'germany' },
            { label: 'Spain', value: 'spain' }
        ]
    }
};

export default siteSettings;
