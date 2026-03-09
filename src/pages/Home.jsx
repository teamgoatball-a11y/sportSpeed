import React, { useState, useEffect, useMemo } from "react"
import MatchCard from "../components/MatchCard"
import MatchCardSkeleton from "../components/MatchCardSkeleton"
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

const CATEGORIES = ["All", "Live", "Football", "Cricket", "Others"]

function Home({ searchQuery }) {
  const [activeTab, setActiveTab] = useState("All")
  const [allMatches, setAllMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'matches'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetched = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAllMatches(fetched);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // Filter matches based on search and category
  const filteredMatches = useMemo(() => {
    const searchLower = searchQuery ? searchQuery.toLowerCase() : "";

    return allMatches.filter(match => {
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
        // Use explicit category if available, fallback to legacy league name matching
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
  }, [searchQuery, activeTab, allMatches]);

  return (
    <div className="p-4 sm:p-6 transition-colors duration-300">

      {/* Header Area */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-500 dark:from-red-500 dark:to-orange-500 bg-clip-text text-transparent inline-block">
          Today's Matches
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm transition-colors duration-300">Live scores, schedules, and premium streams</p>
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