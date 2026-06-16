import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { siteSettings } from '../config/siteSettings';

const pages = {
    'terms': {
        title: 'Terms of Service',
        content: `Welcome to GOATBALL. By accessing this website, you agree to comply with and be bound by the following terms and conditions of use.

1. Acceptance of Terms
By accessing or using GOATBALL, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the service.

2. Content and Links
GOATBALL acts as an index/directory of sports streams found publicly on the internet. We do not manually upload, host, or control the streaming content embedded on our website. All video content is hosted by third-party, external websites.

3. User Conduct
You agree not to use GOATBALL for any unlawful purpose or any purpose prohibited under this clause. You agree not to undertake any action that could damage, disable, overburden, or impair our servers.

4. Changes to Terms
We reserve the right, at our sole discretion, to modify or replace these Terms at any time. Your continued use of the site following the posting of any changes constitutes acceptance of those changes.`
    },
    'privacy': {
        title: 'Privacy Policy',
        content: `Last Updated: ${new Date().toLocaleDateString('en-IN')}

At GOATBALL, your privacy is extremely important to us. This Privacy Policy documents the types of personal information is received and collected by our site and how it is used.

1. Log Files
Like many other websites, GOATBALL makes use of log files. The information inside the log files includes internet protocol (IP) addresses, type of browser, Internet Service Provider (ISP), date/time stamp, referring/exit pages, and number of clicks to analyze trends, administer the site, track user's movement around the site, and gather demographic information. IP addresses, and other such information are not linked to any information that is personally identifiable.

2. Cookies and Web Beacons
GOATBALL uses cookies to store information about visitors' preferences, to record user-specific information on which pages the site visitor accesses or visits, and to personalize or customize our web page content based upon visitors' browser type or other information that the visitor sends via their browser.

3. Third Party Partners
Some of our advertising partners may use cookies and web beacons on our site. These third-party ad servers or ad networks use technology in their respective advertisements and links that appear on GOATBALL and which are sent directly to your browser. They automatically receive your IP address when this occurs.`
    },
    'dmca': {
        title: 'DMCA Disclaimer',
        content: `GOATBALL acts strictly as an index and database of sports streams found publicly available on the internet. 

We do NOT host, upload, or control any of the broadcast streams, videos, or media content appearing on this website. All streaming content is provided by and hosted on independent, third-party external servers entirely out of our control. 

GOATBALL simply links to or embeds content uploaded by others to third-party streaming providers. Therefore, GOATBALL is not responsible for the legality, accuracy, or copyright compliance of the content.

If you have legal issues regarding the content, please contact the appropriate media file owners or host servers directly. Any takedown requests should be directed to the third-party platforms hosting the actual streams.`
    }
};

function StaticPage() {
    const { pageId } = useParams();
    const page = pages[pageId];

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pageId]);

    if (!page) {
        return (
            <div className="text-center py-32 space-y-4 animate-fade-in">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Page Not Found</h2>
                <Link to="/" className="inline-block mt-4 text-red-600 hover:underline">
                    &larr; Back to Home
                </Link>
            </div>
        );
    }

    const processedContent = page.content
        ?.replaceAll('GOATBALL', siteSettings.name.toUpperCase())
        ?.replaceAll('GoatBall', siteSettings.name);

    return (
        <div className="max-w-4xl mx-auto py-12 px-6 animate-fade-in w-full min-h-[50vh]">
            <Helmet>
                <title>{page.title} | {siteSettings.name}</title>
                <meta name="description" content={processedContent?.replace(/<[^>]+>/g, '').substring(0, 150) || `${siteSettings.name} Static Page`} />
            </Helmet>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 italic tracking-tight">{page.title}</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap font-medium">
                {processedContent}
            </div>
        </div>
    );
}

export default StaticPage;
