import { describe, it, expect } from "vitest";
import { applyGuess, calculateScore, MAX_GUESSES, type GameState } from "./game";
import type { PlayerSummary } from "./types";
import { Smokum } from "next/font/google";

const CORRECT_PLAYER = "Nikola Jokic" 

const fakePlayer = (name: string): PlayerSummary => ({
    id: 1, name, team: "DEN", position: "C", age: 30, conference: "West",
});

const newGame = (): GameState => ({
    secretPlayer: fakePlayer(CORRECT_PLAYER),
    guesses: [],
    hintsUsed: 0,
    status: "playing"
})

describe("applyGuess", ()=> {
    it("wins with right guess", () => {
        const s = applyGuess(newGame(), CORRECT_PLAYER);
        expect(s.status).toBe("won");
    });

    it("Wrong Guess", () => {
        const s = applyGuess(newGame(), "Stephen Curry");
        expect(s.guesses).toHaveLength(1);
    });

    it("ignores repeated guess", () => {
        let s = applyGuess(newGame(), "Stephen Curry");
        s = applyGuess(s, "Stephen Curry");
        expect(s.guesses).toHaveLength(1);
    });

    it("looses on last guess", () => {
        let s = newGame()
        for (let i = 0; i < MAX_GUESSES; i++) s = applyGuess(s, `Wrong Player ${i}`);
        expect(s.status).toBe("lost");
    });

    it("ignores guesses after game ended", () => {
        let s = applyGuess(newGame(), CORRECT_PLAYER);
        s = applyGuess(s, "Stephen Curry");
        expect(s.guesses).toHaveLength(1);
        expect(s.status).toBe("won");
    });
});

describe("calculateScore", ()=> {
    it("subtracts guesses and hints", () => {
        let s = newGame()
        s = applyGuess(s, "Stephen Curry");
        s = { ...s, hintsUsed:1};
        s = applyGuess(s, CORRECT_PLAYER);
        expect(calculateScore(s)).toBe(75);
    });

    it("never under zero", ()=> {
        let s = { ...newGame(), hintsUsed: 4 };
        for (let i = 0; i < MAX_GUESSES - 1; i++) s = applyGuess(s, `Wrong Player ${i}`);
        s = applyGuess(s, "Nikola Jokic");
        expect(s.status).toBe("won");
        expect(calculateScore(s)).toBe(0);
    });

    it("lost return always returns zero", () => {
        let s = newGame();
        for (let i = 0; i < MAX_GUESSES; i++) s = applyGuess(s, `Wrong Player ${i}`);
        expect(calculateScore(s)).toBe(0);
    });
});

