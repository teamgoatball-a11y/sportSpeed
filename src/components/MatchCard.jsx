import { Link } from "react-router-dom"

function MatchCard({ match }) {
  const isLive = match.status === "LIVE"

  return (
    <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-red-900/10 transition-all duration-300 relative overflow-hidden flex flex-col h-full">

      {/* Subtle hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-transparent dark:from-red-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      {/* Header: Status and League */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 dark:bg-red-500/20 rounded-full border border-red-500/30">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
              <span className="text-red-600 dark:text-red-500 text-xs font-bold tracking-wider">LIVE</span>
            </div>
          ) : (
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs font-semibold rounded-full border border-gray-200 dark:border-gray-700">
              UPCOMING
            </span>
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-xs font-medium tracking-wide uppercase">{match.league}</span>
      </div>

      {/* Teams Area */}
      <div className="flex-1 flex flex-col justify-center space-y-4 relative z-10">

        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
              {match.team1.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{match.team1}</span>
          </div>
          {isLive && <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">0</span>}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300">
              {match.team2.substring(0, 2).toUpperCase()}
            </div>
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{match.team2}</span>
          </div>
          {isLive && <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">0</span>}
        </div>

      </div>

      {/* Footer: Time and Action */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center relative z-10">
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {match.time}
        </div>

        <Link
          to={`/match/${match.id}`}
          className={`text-sm font-semibold px-4 py-1.5 rounded-full transition-colors ${isLive
              ? 'bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
        >
          {isLive ? 'Watch' : 'Details'}
        </Link>
      </div>

    </div>
  )
}

export default MatchCard