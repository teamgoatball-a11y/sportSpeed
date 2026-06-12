import { Link } from "react-router-dom"
import TeamLogo from "./TeamLogo"
import { getDisplayViews } from "../utils/viewUtils"

function MatchCard({ match }) {
  const isLive = match.status === "LIVE"
  const CardWrapper = match.isApiMatch ? 'div' : Link;
  const wrapperProps = match.isApiMatch ? {} : { to: `/match/${match.id}` };

  return (
    <CardWrapper {...wrapperProps} className={`block group dark:bg-[#1a1a1a] border border-black rounded-sm p-4 sm:p-5 transition-all duration-300 relative flex flex-col h-full ${!match.isApiMatch ? 'hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(0,0,0,0.06)] hover:border-black dark:hover:border-black cursor-pointer' : 'opacity-90 grayscale-[10%]'}`}>

      {/* Header: Status and League */}
      <div className="flex justify-between items-center mb-4 relative z-10">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#f00000] text-white rounded-[2px]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white"></span>
              </span>
              <span className="text-[10px] font-bold tracking-widest uppercase">LIVE</span>
            </div>
          ) : (
            <span className="px-2 py-0.5 bg-black text-white text-[10px] font-bold tracking-widest uppercase rounded-[2px] dark:bg-gray-800">
              UPCOMING
            </span>
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-[11px] font-bold tracking-wider uppercase text-right truncate max-w-[50%]">{match.league}</span>
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
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-gray-900 dark:text-gray-100 text-[15px] line-clamp-1">{match.team1}</span>
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TeamLogo
              teamName={match.team2}
              logoUrl={match.team2Logo}
              teamId={match.team2Id}
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-gray-900 dark:text-gray-100 text-[15px] line-clamp-1">{match.team2}</span>
          </div>
        </div>

      </div>

      {/* Footer: Time + Date */}
      <div className="mt-4 pt-3 border-t border-black flex justify-between items-center relative z-10">
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

        {match.isApiMatch ? (
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
            Streams Pending
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="text-xs font-semibold">{getDisplayViews(match.id, match.views)}</span>
          </div>
        )}
      </div>

    </CardWrapper>
  )
}

export default MatchCard