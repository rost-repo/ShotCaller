import { describe, it, expect } from "vitest";
import { applyGuess, MAX_GUESSES, MAX_HINTS, getWrongGuesses, buildShareText, type GameState } from "./game";
import type { PlayerSummary } from "./types";

const CORRECT_PLAYER = "Nikola Jokic" 

const fakePlayer = (name: string): PlayerSummary => ({
    id: 1, name, team: "DEN", position: "C", age: 30, conference: "West",
    rookieYear: 0, jersey: "1", height: "6-11", division: "Northwest",
    stats: { pts: 27, ast: 9, reb: 12 },
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

describe("getWrongGuesses", () => {
    it("exclui o palpite correto", () => {
        let s = applyGuess(newGame(), "Stephen Curry");
        s = applyGuess(s, CORRECT_PLAYER);
        expect(getWrongGuesses(s)).toEqual(["Stephen Curry"]);
    });
});

describe("hintsUsed", () => {
    it("avança a cada palpite", () => {
        let s = applyGuess(newGame(), "Wrong 1");
        expect(s.hintsUsed).toBe(1);
        s = applyGuess(s, "Wrong 2");
        expect(s.hintsUsed).toBe(2);
    });

    it("não passa do total de dicas", () => {
        let s = newGame();
        for (let i = 0; i < MAX_GUESSES; i++) s = applyGuess(s, `Wrong ${i}`);
        expect(s.hintsUsed).toBe(MAX_HINTS);
    });
});

describe("buildShareText", () => {
    const FIXED = new Date("2026-07-29T12:00:00Z");

    it("marca o acerto e deixa os slots não usados em branco", () => {
        let s = applyGuess(newGame(), "Stephen Curry");
        s = applyGuess(s, CORRECT_PLAYER);
        expect(buildShareText(s, FIXED)).toBe("Shotcaller 2026-07-29 2/6\n🟥🟩⬜⬜⬜⬜");
    });

    it("usa X na derrota", () => {
        let s = newGame();
        for (let i = 0; i < MAX_GUESSES; i++) s = applyGuess(s, `Wrong ${i}`);
        expect(buildShareText(s, FIXED)).toBe("Shotcaller 2026-07-29 X/6\n🟥🟥🟥🟥🟥🟥");
    });

    it("nunca vaza o nome do jogador", () => {
        const s = applyGuess(newGame(), CORRECT_PLAYER);
        expect(buildShareText(s, FIXED)).not.toContain(CORRECT_PLAYER);
    });
});
