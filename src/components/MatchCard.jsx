import { Link } from "react-router-dom"
import TeamLogo from "./TeamLogo"
import { getDisplayViews } from "../utils/viewUtils"

function MatchCard({ match }) {
  const isLive = match.status === "LIVE"
  const CardWrapper = match.isApiMatch ? 'div' : Link;
  const wrapperProps = match.isApiMatch ? {} : { to: `/match/${match.id}` };

  return (
    <CardWrapper {...wrapperProps} className={`block group relative flex flex-col h-full overflow-hidden p-4 sm:p-5 ${!match.isApiMatch ? 'glass-card glass-card-hover cursor-pointer' : 'glass-card opacity-90 grayscale-[10%]'}`}>

      {/* Header: Status and League */}
      <div className="flex justify-between items-center mb-3 relative z-10">
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-500 rounded-full border border-red-200 dark:border-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 dark:bg-red-500"></span>
              </span>
              <span className="text-[10px] font-black tracking-widest uppercase">LIVE</span>
            </div>
          ) : match.status === "FINISHED" ? (
            <span className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-[10px] font-black tracking-widest uppercase rounded-full border border-gray-200 dark:border-gray-700">
              FINISHED
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-full border border-blue-200 dark:border-blue-800/30">
              UPCOMING
            </span>
          )}
        </div>
        <span className="text-gray-400 dark:text-gray-500 text-[10px] font-bold tracking-wider uppercase text-right truncate max-w-[50%] bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-md">
          {match.league}
        </span>
      </div>

      {/* Teams Area */}
      <div className="flex-1 flex flex-col justify-center space-y-2 relative z-10 my-1">
        {/* Team 1 */}
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <TeamLogo
                teamName={match.team1}
                logoUrl={match.team1Logo}
                teamId={match.team1Id}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base line-clamp-1">{match.team1}</span>
          </div>
        </div>

        {/* VS Divider (Subtle) */}
        <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-4 py-0.5 flex items-center">
            <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 italic">VS</span>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between group-hover:translate-x-1 transition-transform duration-300 delay-75">
          <div className="flex items-center gap-3.5">
            <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
              <TeamLogo
                teamName={match.team2}
                logoUrl={match.team2Logo}
                teamId={match.team2Id}
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-gray-900 dark:text-gray-100 text-base line-clamp-1">{match.team2}</span>
          </div>
        </div>

      </div>

      {/* Footer: Time + Date */}
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end relative z-10">
        <div className="flex flex-col gap-1">
          <div className="text-gray-700 dark:text-gray-300 text-sm font-bold flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-red-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {match.time}
          </div>
          {match.date && (() => {
            const dNow = new Date();
            const year = dNow.getFullYear();
            const month = String(dNow.getMonth() + 1).padStart(2, '0');
            const day = String(dNow.getDate()).padStart(2, '0');
            const today = `${year}-${month}-${day}`;
            if (match.date === today) {
              return <span className="text-[11px] text-green-600 dark:text-green-400 font-bold uppercase tracking-wider pl-0.5">Today</span>;
            }
            const d = new Date(match.date + 'T00:00:00');
            const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return <span className="text-[11px] text-orange-500 dark:text-orange-400 font-bold uppercase tracking-wider pl-0.5">{label}</span>;
          })()}
        </div>

        {match.isApiMatch ? (
          <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl">
            Streams Pending
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-xl transition-colors group-hover:bg-red-50 group-hover:border-red-100 group-hover:text-red-600 dark:group-hover:bg-red-500/10 dark:group-hover:border-red-500/20 dark:group-hover:text-red-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="text-xs font-bold">{getDisplayViews(match.id, match.views)}</span>
          </div>
        )}
      </div>

    </CardWrapper>
  )
}

export default MatchCard