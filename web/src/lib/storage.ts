import { MAX_GUESSES } from "./game";
import { Stats } from "./types";

const TODAY_KEY = "shotcaller:today";
const STATS_KEY = "shotcaller:stats";

const EMPTY_STATS: Stats = {
    played: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: Array.from({ length: MAX_GUESSES }, () => 0),
    lastCompletedDay: null,
};
interface TodayGame {
    day: string;
    guesses: string[];
}

function dayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function loadTodayGuesses(): string[] {
    try {
        const raw = localStorage.getItem(TODAY_KEY);
        if (!raw) return [];

        const saved: TodayGame = JSON.parse(raw);
        return saved.day === dayKey() ? saved.guesses : [];
    } catch {
        return [];
    }
}

export function saveTodayGuesses(guesses: string[]): void {
    try {
        localStorage.setItem(TODAY_KEY, JSON.stringify({ day: dayKey(), guesses }));
    } catch {
    }
}

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