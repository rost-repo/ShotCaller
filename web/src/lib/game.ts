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
    getValue: (player: PlayerSummary) => string;
}

export const HINTS: HintDefinition[] = [
    { label: "Age", getValue: (p) => String(p.age) },
    { label: "Height", getValue: (p) => p.height },
    { label: "Position", getValue: (p) => p.position },
    { label: "Conference", getValue: (p) => p.conference },
    { label: "Team", getValue: (p) => p.team },
];

export const MAX_HINTS = HINTS.length;

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