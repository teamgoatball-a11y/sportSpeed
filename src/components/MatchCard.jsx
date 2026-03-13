import { Link } from "react-router-dom"
import TeamLogo from "./TeamLogo"

function MatchCard({ match }) {
  const isLive = match.status === "LIVE"
  const CardWrapper = match.isApiMatch ? 'div' : Link;
  const wrapperProps = match.isApiMatch ? {} : { to: `/match/${match.id}` };

  return (
    <CardWrapper {...wrapperProps} className={`block group bg-white dark:bg-gray-900 border border-gray-200 shadow-sm dark:border-gray-800 rounded-xl p-5 transition-all duration-300 relative overflow-hidden flex flex-col h-full ${!match.isApiMatch ? 'hover:border-red-500/30 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-red-900/5 dark:hover:shadow-red-900/10 transform hover:-translate-y-1 cursor-pointer' : 'opacity-90 grayscale-[10%]'}`}>

      {/* Subtle hover gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent dark:from-red-500/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

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
            <TeamLogo
              teamName={match.team1}
              logoUrl={match.team1Logo}
              teamId={match.team1Id}
              className="w-8 h-8 object-contain"
            />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{match.team1}</span>
          </div>
          {isLive && <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">0</span>}
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo
              teamName={match.team2}
              logoUrl={match.team2Logo}
              teamId={match.team2Id}
              className="w-8 h-8 object-contain"
            />
            <span className="font-semibold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">{match.team2}</span>
          </div>
          {isLive && <span className="font-mono font-bold text-gray-900 dark:text-white text-lg">0</span>}
        </div>

      </div>

      {/* Footer: Time + Date */}
      <div className="mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center relative z-10">
        <div className="flex flex-col gap-0.5">
          <div className="text-gray-500 dark:text-gray-400 text-sm font-medium flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {match.time}
          </div>
          {match.date && (() => {
            const today = new Date().toISOString().slice(0, 10);
            if (match.date === today) {
              return <span className="text-xs text-green-500 dark:text-green-400 font-semibold pl-0.5">Today</span>;
            }
            const d = new Date(match.date + 'T00:00:00');
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return <span className="text-xs text-orange-400 dark:text-orange-400 font-semibold pl-0.5">{label}</span>;
          })()}
        </div>

        {match.isApiMatch && (
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
            Streams Pending
          </span>
        )}
      </div>

    </CardWrapper>
  )
}

export default MatchCard