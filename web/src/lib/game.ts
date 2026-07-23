import { stat } from "fs";
import type { PlayerSummary } from "./types";

export const MAX_GUESSES = 6;
export const WRONG_GUESS_PENALTY = 10;
export const HINT_PENALTY = 15;

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
    secretPlayer: PlayerSummary;
    guesses: string[];
    hintsUsed: number;
    status: GameStatus;
}

export function calculateScore(state: GameState): number {
    if (state.status === "lost") return 0;
    const wrong = state.guesses.filter((g) => g !== state.secretPlayer.name).length;
    return Math.max(0, 100- wrong * WRONG_GUESS_PENALTY - state.hintsUsed * HINT_PENALTY);
}

export function applyGuess(state: GameState, guessName: string): GameState{
    if (state.status !== "playing") return state;
    if (state.guesses.includes(guessName)) return state;
    
    const guesses = [...state.guesses, guessName];
    const correct = guessName === state.secretPlayer.name;

    let status: GameStatus = "playing";
    if (correct) status = "won";
    else if (guesses.length >= MAX_GUESSES) status = "lost";

    return {...state, guesses, status };
}

export interface HintDefinition {
    label: string;
    getValue: (player: PlayerSummary) => string;
}

export const HINTS: HintDefinition[] = [
    { label: "Idade", getValue: (p) => String(p.age) },
    { label: "Posição", getValue: (p) => p.position },
    { label: "Conferência", getValue: (p) => p.conference },
    { label: "Número da camisa", getValue: (p) => p.jersey },
    { label: "Ano de rookie", getValue: (p) => String(p.rookieYear) },
];

export const MAX_HINTS = HINTS.length;   // nunca dessincroniza — vem do array acima

export function canUnlockHint(wrongGuesses: number, hintsUsed: number): boolean {
    return wrongGuesses > 0 && hintsUsed < MAX_HINTS;
}