import React, { useState, useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../config/firebase';
import toast from 'react-hot-toast';

function MatchPrediction({ match }) {
    const [hasVoted, setHasVoted] = useState(false);
    const [votedFor, setVotedFor] = useState(null);
    const [votes, setVotes] = useState({
        team1: match?.predictions?.team1 || 0,
        team2: match?.predictions?.team2 || 0,
        draw: match?.predictions?.draw || 0
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!match?.id) return;
        const voted = localStorage.getItem(`voted_match_${match.id}`);
        if (voted) {
            setHasVoted(true);
            setVotedFor(voted);
        }
        setVotes({
            team1: match.predictions?.team1 || 0,
            team2: match.predictions?.team2 || 0,
            draw: match.predictions?.draw || 0
        });
    }, [match]);

    const handleVote = async (choice) => {
        if (hasVoted || isSubmitting) return;
        setIsSubmitting(true);

        try {
            const docRef = doc(db, 'matches', match.id);
            await updateDoc(docRef, {
                [`predictions.${choice}`]: increment(1)
            });

            localStorage.setItem(`voted_match_${match.id}`, choice);
            setHasVoted(true);
            setVotedFor(choice);
            setVotes(prev => ({
                ...prev,
                [choice]: prev[choice] + 1
            }));
            toast.success("Vote cast successfully!");
        } catch (error) {
            console.error("Error casting vote:", error);
            toast.error("Failed to cast vote.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const totalVotes = votes.team1 + votes.team2 + votes.draw;
    
    const getPercentage = (count) => {
        if (totalVotes === 0) return 0;
        return Math.round((count / totalVotes) * 100);
    };

    const team1Pct = getPercentage(votes.team1);
    const team2Pct = getPercentage(votes.team2);
    const drawPct = getPercentage(votes.draw);

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden relative">
            <div className="text-center mb-6">
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Who Will Win?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Make your prediction to see what others think</p>
            </div>

            {!hasVoted ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={() => handleVote('team1')}
                        disabled={isSubmitting}
                        className="px-4 py-4 sm:py-6 bg-gray-50 hover:bg-indigo-50 dark:bg-gray-800 dark:hover:bg-indigo-500/10 border-2 border-gray-200 hover:border-indigo-500 dark:border-gray-700 dark:hover:border-indigo-500 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <span className="font-bold text-gray-900 dark:text-white text-lg text-center leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{match.team1}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Win</span>
                    </button>

                    <button
                        onClick={() => handleVote('draw')}
                        disabled={isSubmitting}
                        className="px-4 py-4 sm:py-6 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border-2 border-gray-200 hover:border-gray-400 dark:border-gray-700 dark:hover:border-gray-500 rounded-xl transition-all flex flex-col items-center justify-center gap-2 group"
                    >
                        <span className="font-bold text-gray-900 dark:text-white text-lg text-center leading-tight">Draw</span>
                    </button>

                    <button
                        onClick={() => handleVote('team2')}
                        disabled={isSubmitting}
                        className="px-4 py-4 sm:py-6 bg-gray-50 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-500/10 border-2 border-gray-200 hover:border-red-500 dark:border-gray-700 dark:hover:border-red-500 rounded-xl transition-all flex flex-col items-center gap-2 group"
                    >
                        <span className="font-bold text-gray-900 dark:text-white text-lg text-center leading-tight group-hover:text-red-600 dark:group-hover:text-red-400">{match.team2}</span>
                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Win</span>
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="text-center">
                        <span className="inline-block px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold uppercase tracking-wider">
                            You voted for {votedFor === 'team1' ? match.team1 : votedFor === 'team2' ? match.team2 : 'Draw'}
                        </span>
                    </div>

                    <div className="space-y-4">
                        {/* Team 1 Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-bold text-gray-900 dark:text-white truncate pr-4">{match.team1}</span>
                                <span className="font-black text-indigo-600 dark:text-indigo-400">{team1Pct}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${team1Pct}%` }}></div>
                            </div>
                        </div>

                        {/* Draw Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-bold text-gray-600 dark:text-gray-400 truncate pr-4">Draw</span>
                                <span className="font-black text-gray-600 dark:text-gray-400">{drawPct}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-400 rounded-full transition-all duration-1000 ease-out" style={{ width: `${drawPct}%` }}></div>
                            </div>
                        </div>

                        {/* Team 2 Bar */}
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-end text-sm">
                                <span className="font-bold text-gray-900 dark:text-white truncate pr-4">{match.team2}</span>
                                <span className="font-black text-red-500 dark:text-red-400">{team2Pct}%</span>
                            </div>
                            <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-red-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${team2Pct}%` }}></div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-xs text-gray-400 font-medium">
                        {totalVotes} total votes
                    </div>
                </div>
            )}
        </div>
    );
}

export default MatchPrediction;
