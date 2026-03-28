import React, { useState, useEffect, useMemo } from "react"
import MatchCard from "../components/MatchCard"
import MatchCardSkeleton from "../components/MatchCardSkeleton"
import AdBanner from "../components/AdBanner"
import SmartLinkAd from "../components/SmartLinkAd"
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore'
import { db } from '../config/firebase'

const CATEGORIES = ["All", "Live", "Football", "Cricket", "Others"]

function Home({ searchQuery }) {
  const [activeTab, setActiveTab] = useState("All")
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(() => new Date())

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
      <div className="mb-6 hidden sm:block">
        <h1 className="text-3xl sm:text-4xl font-black italic tracking-tighter bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent uppercase break-words">
          Live & Upcoming Action
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm sm:text-base font-medium max-w-2xl transition-colors duration-300">
          Catch every goal, wicket, and highlight. Stream premium sports in real-time.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="mb-8 pb-4 border-b border-gray-200 dark:border-gray-800 overflow-x-auto hide-scrollbar transition-colors duration-300">
        <div className="flex space-x-3 min-w-max p-1">
          {CATEGORIES.map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${activeTab === category
                ? "bg-red-600 text-white shadow-md shadow-red-600/30 border border-red-600"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 shadow-sm"
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

    </div>
  )
}

export default Home