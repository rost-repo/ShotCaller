import { describe, it, expect } from "vitest";
import { deriveGame, addGuess } from "./secret";
import { MAX_GUESSES, MAX_HINTS } from "./game";
import type { PlayerSummary } from "./types";

const CORRECT = "Nikola Jokic";

const player: PlayerSummary = {
    id: 1, name: CORRECT, team: "DEN", position: "C", age: 30, conference: "West",
    rookieYear: 0, jersey: "1", height: "6-11", division: "Northwest",
    stats: { pts: 27, ast: 9, reb: 12 },
};

const wrongGuesses = (n: number) => Array.from({ length: n }, (_, i) => `Wrong ${i}`);

describe("deriveGame", () => {
    it("wins on the correct guess", () => {
        expect(deriveGame(player, [CORRECT]).status).toBe("won");
    });

    it("keeps playing after a wrong guess", () => {
        expect(deriveGame(player, ["Stephen Curry"]).status).toBe("playing");
    });

    it("loses when guesses run out", () => {
        expect(deriveGame(player, wrongGuesses(MAX_GUESSES)).status).toBe("lost");
    });

    it("treats a correct final guess as a win, not a loss", () => {
        const guesses = [...wrongGuesses(MAX_GUESSES - 1), CORRECT];
        expect(deriveGame(player, guesses).status).toBe("won");
    });

    it("reveals one hint per guess", () => {
        expect(deriveGame(player, []).hints).toHaveLength(0);
        expect(deriveGame(player, wrongGuesses(1)).hints).toHaveLength(1);
        expect(deriveGame(player, wrongGuesses(2)).hints).toHaveLength(2);
    });

    it("never reveals more hints than exist", () => {
        expect(deriveGame(player, wrongGuesses(MAX_GUESSES)).hints).toHaveLength(MAX_HINTS);
    });
});

describe("addGuess", () => {
    it("appends a new guess", () => {
        expect(addGuess(["Stephen Curry"], CORRECT)).toEqual(["Stephen Curry", CORRECT]);
    });

    it("ignores a repeated guess", () => {
        expect(addGuess(["Stephen Curry"], "Stephen Curry")).toEqual(["Stephen Curry"]);
    });

    it("does not mutate the original array", () => {
        const previous = ["Stephen Curry"];
        addGuess(previous, CORRECT);
        expect(previous).toEqual(["Stephen Curry"]);
    });
});