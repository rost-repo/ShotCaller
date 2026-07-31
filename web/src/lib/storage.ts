import type { GameState } from "./game";

const PREFIX = "shotcaller:guesses:";

export function dayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function loadGuesses(day: string): string[] {
    try {
        const raw = localStorage.getItem(PREFIX + day);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveGuesses(day: string, guesses: string[]): void {
    try {
        localStorage.setItem(PREFIX + day, JSON.stringify(guesses));
    } catch {}
}

export interface DayResult {
    won: boolean;
    guesses: number;
}

const RESULTS_KEY = "shotcaller:results";

export function loadResults(): Record<string, DayResult> {
    try {
        const raw = localStorage.getItem(RESULTS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveResult(day: string, result: DayResult): void {
    try {
        const all = loadResults();
        all[day] = result;
        localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch {}
}

export function persistGame(day: string, state: GameState): void {
    saveGuesses(day, state.guesses);

    if (state.status !== "playing") {
        saveResult(day, { won: state.status === "won", guesses: state.guesses.length });
    }
}