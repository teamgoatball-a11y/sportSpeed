function MatchCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-900 border border-black rounded-xl p-5 h-full flex flex-col relative overflow-hidden animate-pulse">

            {/* Header: Status and League */}
            <div className="flex justify-between items-center mb-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-800 rounded"></div>
            </div>

            {/* Teams Area */}
            <div className="flex-1 flex flex-col justify-center space-y-4">

                {/* Team 1 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-6"></div>
                </div>

                {/* Team 2 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-28"></div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-6"></div>
                </div>

            </div>

            {/* Footer: Time */}
            <div className="mt-5 pt-4 border-t border-black flex justify-between items-center">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-800"></div>
                </div>
            </div>

        </div>
    )
}

export default MatchCardSkeleton
