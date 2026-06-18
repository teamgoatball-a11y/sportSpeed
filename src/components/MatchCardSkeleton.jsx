function MatchCardSkeleton() {
    return (
        <div className="glass-card p-4 sm:p-5 h-full flex flex-col relative overflow-hidden animate-pulse">

            {/* Header: Status and League */}
            <div className="flex justify-between items-center mb-3">
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full"></div>
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded-md"></div>
            </div>

            {/* Teams Area */}
            <div className="flex-1 flex flex-col justify-center space-y-2 my-1">

                {/* Team 1 */}
                <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                </div>

                {/* VS Divider */}
                <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800 ml-4 py-0.5">
                    <div className="h-3 w-4 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
                </div>

            </div>

            {/* Footer: Time */}
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-end">
                <div className="flex flex-col gap-1">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
                <div className="h-7 w-16 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
            </div>

        </div>
    )
}

export default MatchCardSkeleton
