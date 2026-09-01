import type { PlayerSummary } from "./types";

export const MAX_GUESSES = 6;
const SITE_URL = "https://shotcaller-game.vercel.app";

export type GameStatus = "playing" | "won" | "lost";

export interface GameState {
    guesses: string[];
    status: GameStatus;
    hints: string[];
    answer: string | null;
}

export interface HintDefinition {
    label: string;
    shortLabel: string;
    getValue: (player: PlayerSummary) => string;
}

export const HINTS: HintDefinition[] = [
    { label: "Age",        shortLabel: "AGE",  getValue: (p) => String(p.age) },
    { label: "Height",     shortLabel: "HT",   getValue: (p) => p.height },
    { label: "Conference", shortLabel: "CONF", getValue: (p) => p.conference },
    { label: "Division", shortLabel: "DIV", getValue: (p) => p.division },
    { label: "Team",       shortLabel: "TEAM", getValue: (p) => p.team },
];

export const MAX_HINTS = HINTS.length;

export type Pip = "empty" | "wrong" | "correct";

export function getPips(state: GameState, total = MAX_GUESSES): Pip[] {
    return Array.from({ length: total }, (_, i) => {
        if (i >= state.guesses.length) return "empty";
        return state.status === "won" && i === state.guesses.length - 1 ? "correct" : "wrong";
    });
}

export function getWrongGuesses(state: GameState): string[] {
    return state.status === "won" ? state.guesses.slice(0, -1) : state.guesses;
}

export function buildShareText(state: GameState, day: string): string {
    const squares = getPips(state)
        .map((p) => (p === "empty" ? "⬜" : p === "correct" ? "🟩" : "🟥"))
        .join("");

    const score = state.status === "won" ? `${state.guesses.length}/${MAX_GUESSES}` : `X/${MAX_GUESSES}`;

    return `Shotcaller ${day} ${score}\n${squares}\n${SITE_URL}`;
}
