import React, { useState, useEffect, useMemo } from "react"
import MatchCard from "../components/MatchCard"
import MatchCardSkeleton from "../components/MatchCardSkeleton"
import AdBanner from "../components/AdBanner"
import SmartLinkAd from "../components/SmartLinkAd"
import ArticleCard from "../components/ArticleCard"
import HighlightCard from "../components/HighlightCard"
import { useArticles } from "../hooks/useArticles"
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { Link } from 'react-router-dom'

const CATEGORIES = ["All", "Live", "Football", "Cricket", "Others"]

function Home({ searchQuery }) {
  const [activeTab, setActiveTab] = useState("All")
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [homeHighlights, setHomeHighlights] = useState([]);
  const [highlightsLoading, setHighlightsLoading] = useState(true);

  // Fetch latest 3 news articles
  const { articles: latestNews, loading: newsLoading } = useArticles({
    publishedOnly: true,
    limitCount: 3
  });

  // Refresh current time every minute so auto-status updates without page reload
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(100));

    // onSnapshot serves from IndexedDB cache instantly (due to enableIndexedDbPersistence),
    // then fires again when fresh data arrives from Firestore — no waiting for network!
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const matches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllMatches(matches);
      setLoading(false); // Hide skeleton as soon as first data arrives (cache or network)
    }, (error) => {
      console.error("Error loading matches:", error);
      setLoading(false);
    });

    return () => unsubscribe(); // Clean up listener on unmount
  }, []);

  // Fetch Latest 4 Highlights for Home
  useEffect(() => {
    const q = query(collection(db, 'highlights'), orderBy('createdAt', 'desc'), limit(4));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setHomeHighlights(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setHighlightsLoading(false);
    });
    return () => unsubscribe();
  }, []);


  // Filter and sort matches based on search and category
  const filteredMatches = useMemo(() => {
    const searchLower = searchQuery ? searchQuery.toLowerCase() : "";
    const now = currentTime;

    // Compute effective match status based on current time + match date
    const getEffectiveStatus = (match) => {
      // If admin already set it to LIVE or FINISHED, respect that
      if (match.status === 'LIVE') return 'LIVE';
      if (match.status === 'FINISHED') return 'FINISHED';
      // If no date is stored, don't auto-compute — leave as UPCOMING
      if (!match.date) return match.status;
      if (!match.time || match.time === 'TBD') return match.status;
      try {
        // Combine exact match date + time for accurate comparison
        let kickOff = new Date(`${match.date} ${match.time}`);
        if (isNaN(kickOff.getTime())) return match.status;
        const msSinceKickOff = now.getTime() - kickOff.getTime();
        if (msSinceKickOff > 0 && msSinceKickOff < 2 * 60 * 60 * 1000) {
          return 'LIVE'; // Within 2 hours of kick-off → LIVE
        }
        if (msSinceKickOff >= 2 * 60 * 60 * 1000) {
          return 'FINISHED'; // More than 2 hours past → FINISHED
        }
        return 'UPCOMING';
      } catch { return match.status; }
    };

    const filtered = allMatches.map(match => ({
      ...match,
      status: getEffectiveStatus(match) // auto-compute status from time
    })).filter(match => {
      // 1. Search Filter
      const matchesSearch = searchLower === "" ||
        match.team1.toLowerCase().includes(searchLower) ||
        match.team2.toLowerCase().includes(searchLower) ||
        match.league.toLowerCase().includes(searchLower);

      // 2. Category Filter
      let matchesCategory = true;
      if (activeTab === "Live") {
        matchesCategory = match.status === "LIVE";
      } else if (activeTab !== "All") {
        if (match.category) {
          matchesCategory = match.category === activeTab;
        } else {
          const league = match.league.toLowerCase();
          const isFootball = league.includes("premier") || league.includes("champions") || league.includes("la liga") || league.includes("laliga") || league.includes("football") || league.includes("soccer");
          const isCricket = league.includes("t20") || league.includes("test") || league.includes("odi") || league.includes("cricket") || league.includes("ipl");

          if (activeTab === "Football") matchesCategory = isFootball;
          else if (activeTab === "Cricket") matchesCategory = isCricket;
          else if (activeTab === "Others") matchesCategory = !isFootball && !isCricket;
        }
      }

      return matchesSearch && matchesCategory;
    });

    // Sort: LIVE first → UPCOMING (soonest time first) → FINISHED last
    const statusOrder = { LIVE: 0, UPCOMING: 1, FINISHED: 2 };

    const parseTime = (timeStr, dateStr) => {
      if (!timeStr || timeStr === 'TBD') return Infinity;
      try {
        const nowRef = new Date();
        // Prefer the match's actual date so tomorrow's matches sort after today's
        let matchTime = dateStr
          ? new Date(`${dateStr} ${timeStr}`)
          : new Date(`${nowRef.toDateString()} ${timeStr}`);
        if (isNaN(matchTime.getTime())) {
          matchTime = new Date(`${nowRef.toDateString()} ${timeStr}`);
          if (isNaN(matchTime.getTime())) return Infinity;
        }
        // Return ms until match — smaller = sooner = first
        return matchTime.getTime() - nowRef.getTime();
      } catch {
        return Infinity;
      }
    };

    return [...filtered].sort((a, b) => {
      const statusDiff = (statusOrder[a.status] ?? 1) - (statusOrder[b.status] ?? 1);
      if (statusDiff !== 0) return statusDiff;
      // Within same status, sort UPCOMING by soonest time (pass date for accuracy)
      if (a.status === 'UPCOMING') return parseTime(a.time, a.date) - parseTime(b.time, b.date);
      return 0;
    });
  }, [searchQuery, activeTab, allMatches, currentTime]);


  return (
    <div className="p-4 sm:p-6 transition-colors duration-300">

      {/* Header Area */}
      <div className="mb-6 mt-4 hidden sm:block">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111] dark:text-white mb-2 uppercase tracking-wide">
          Match <span className="border-b-[3px] border-[#f00000] pb-1">Center</span>
        </h1>
      </div>

      {/* Category Pills Slider */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar transition-colors duration-300">
        <div className="flex space-x-3 min-w-max p-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-1.5 text-sm font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap ${activeTab === category
                ? "bg-white text-[#111] shadow-[0_2px_10px_rgba(0,0,0,0.05)] border-b-2 border-[#f00000]"
                : "bg-transparent text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
                }`}
            >
              {category === "Live" && <span className="mr-2 text-red-500">•</span>}
              {category}
            </button>
          ))}
        </div>
      </div>

      <SmartLinkAd />

      {/* Main Content Area */}
      {loading ? (
        // Loading Skeleton State
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredMatches.length > 0 ? (
        // Flat Match Results Grid
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-gray-100 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800 animate-fade-in transition-colors duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600 mb-4 transition-colors duration-300">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-300">No Matches Found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto transition-colors duration-300">
            {searchQuery
              ? `We couldn't find any matches matching "${searchQuery}".`
              : "There are no matches currently scheduled for this category."}
          </p>
          {(searchQuery || activeTab !== "All") && (
            <button
              onClick={() => setActiveTab("All")}
              className="mt-6 bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors shadow-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Recent Highlights Section */}
      {!searchQuery && activeTab === "All" && homeHighlights.length > 0 && (
        <div className="mt-16 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide uppercase italic font-display">
              Latest <span className="text-red-600">Highlights</span>
            </h2>
            <Link to="/highlights" className="text-sm font-semibold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1 group">
              View All <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {homeHighlights.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
        </div>
      )}

      {/* Highlights Hub Banner (Always show if no highlights yet or as secondary CTA) */}
      {!searchQuery && activeTab === "All" && homeHighlights.length === 0 && (
        <div className="mt-16 animate-fade-in">
          <Link to="/highlights" className="group block relative overflow-hidden rounded-[2rem] bg-gray-900 border border-gray-800 shadow-2xl transition-all hover:border-red-500/50">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-transparent z-10 group-hover:from-red-600/30 transition-colors"></div>
            
            <div className="relative z-20 p-8 sm:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                  Coming Soon
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
                  Match <span className="text-red-600">Highlights</span> Hub
                </h2>
                <p className="text-gray-400 font-medium text-sm sm:text-base max-w-md">
                  We are building a manual gallery of official goals and match recaps. Stay tuned!
                </p>
              </div>
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-gray-900 group-hover:bg-red-600 group-hover:text-white transition-all">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Latest News Section */}
      {!searchQuery && activeTab === "All" && (
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-wide uppercase mb-2">
                Latest <span className="border-b-[3px] border-[#f00000] pb-1">News</span>
              </h2>
            </div>
            <Link to="/news" className="hidden sm:flex text-sm font-semibold text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 items-center gap-1 group">
              View All News <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl bg-gray-200 dark:bg-gray-800 overflow-hidden">
                  <div className="aspect-video bg-gray-300 dark:bg-gray-700"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : latestNews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 sm:gap-6">
              {latestNews.map((article, i) => (
                <ArticleCard key={article.id} article={article} variant={i < 4 ? 'featured' : 'grid'} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400">No news articles published yet.</p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
             <Link to="/news" className="inline-flex text-sm font-semibold text-red-600 dark:text-red-500 border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 px-6 py-2 rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
              Explore All News
            </Link>
          </div>
        </div>
      )}

    </div>
  )
}

export default Home