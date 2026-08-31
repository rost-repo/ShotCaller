import { MAX_GUESSES } from "./game";
import { dayKey } from "./day";
import { ArchiveResults, Stats } from "./types";

const STATS_KEY = "shotcaller:stats";
const ARCHIVE_KEY = "shotcaller:archive";

const EMPTY_STATS: Stats = {
    played: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: Array.from({ length: MAX_GUESSES }, () => 0),
    lastCompletedDay: null,
};

export function loadStats(): Stats {
    try {
        const raw = localStorage.getItem(STATS_KEY);
        return raw ? { ...EMPTY_STATS, ...JSON.parse(raw) } : EMPTY_STATS;
    } catch {
        return EMPTY_STATS;
    }
}

export function recordResult(won: boolean, guesses: number): void {
    try {
        const today = dayKey();
        const stats = loadStats();

        if (stats.lastCompletedDay === today) return;

        const yesterday = dayKey(new Date(Date.now() - 86_400_000));
        const continued = stats.lastCompletedDay === yesterday;

        const currentStreak = won ? (continued ? stats.currentStreak + 1 : 1) : 0;

        const distribution = [...stats.distribution];
        if (won) distribution[guesses - 1] += 1;

        localStorage.setItem(STATS_KEY, JSON.stringify({
            played: stats.played + 1,
            currentStreak,
            maxStreak: Math.max(stats.maxStreak, currentStreak),
            distribution,
            lastCompletedDay: today,
        }));
    } catch {
    }
}

export function loadArchiveResults(): ArchiveResults {
    try {
        const raw = localStorage.getItem(ARCHIVE_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function recordArchiveResult(day: string, won: boolean, guesses: number): void {
    try {
        const results = loadArchiveResults();

        // Keep the first outcome: the effect re-runs on every reload of a finished game.
        if (day in results) return;

        results[day] = won ? guesses : "X";
        localStorage.setItem(ARCHIVE_KEY, JSON.stringify(results));
    } catch {
    }
}
