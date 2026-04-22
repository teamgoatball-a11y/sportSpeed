/**
 * Global site settings and configuration.
 * Centralizing these values makes it easier to update brand info, social links, and SEO defaults.
 */

export const siteSettings = {
    name: 'GoatBall',
    tagline: 'Stream Live Sports Anytime, Anywhere',
    description: 'GoatBall is your ultimate destination for live sports streaming, news, and match highlights. Follow your favorite teams and never miss a goal.',
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
        defaultTitle: 'GoatBall - Live Sports Streaming & News',
        titleTemplate: '%s | GoatBall',
        defaultDescription: 'Watch live football, cricket, and more on GoatBall. Get the latest sports news, match previews, and highlights.',
        keywords: 'live sports, football streaming, cricket live, match highlights, sports news, world cup, premier league',
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
