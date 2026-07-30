import type { PlayerSummary } from "./types";

export const MAX_GUESSES = 6;

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
    secretPlayer: PlayerSummary;
    guesses: string[];
    hintsUsed: number;
    status: GameStatus;
}

export interface HintDefinition {
    label: string;
    shortLabel: string;
    getValue: (player: PlayerSummary) => string;
}

export const HINTS: HintDefinition[] = [
    { label: "Age",        shortLabel: "AGE",  getValue: (p) => String(p.age) },
    { label: "Height",     shortLabel: "HT",   getValue: (p) => p.height },
    { label: "Position",   shortLabel: "POS",  getValue: (p) => p.position },
    { label: "Conference", shortLabel: "CONF", getValue: (p) => p.conference },
    { label: "Team",       shortLabel: "TEAM", getValue: (p) => p.team },
];

export const MAX_HINTS = HINTS.length;

export interface GuessResult {
    name: string;
    correct: boolean;
}

export function getGuessResults(state: GameState): GuessResult[] {
    return state.guesses.map((name) => ({
        name,
        correct: name === state.secretPlayer.name,
    }));
}

export function getWrongGuesses(state: GameState): string[] {
    return state.guesses.filter((name) => name !== state.secretPlayer.name);
}

export function applyGuess(state: GameState, guessName: string): GameState {
    if (state.status !== "playing") return state;
    if (state.guesses.includes(guessName)) return state;

    const guesses = [...state.guesses, guessName];
    const correct = guessName === state.secretPlayer.name;

    let status: GameStatus = "playing";
    if (correct) status = "won";
    else if (guesses.length >= MAX_GUESSES) status = "lost";

    const hintsUsed = Math.min(guesses.length, MAX_HINTS);

    return { ...state, guesses, status, hintsUsed };
}

export function buildShareText(state: GameState, date = new Date()): string {
    const results = getGuessResults(state);

    const squares = Array.from({ length: MAX_GUESSES }, (_, i) => {
        const result = results[i];
        if (result === undefined) return "⬜";
        return result.correct ? "🟩" : "🟥";
    }).join("");

    const score = state.status === "won" ? `${results.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;
    const day = date.toISOString().slice(0, 10);

    return `Shotcaller ${day} ${score}\n${squares}`;
}