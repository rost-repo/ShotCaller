import { describe, it, expect } from "vitest";
import { shuffled } from "./random";

const items = [10, 20, 30, 40, 50, 60, 70, 80];

describe("shuffled", () => {
    it("keeps every element exactly once", () => {
        expect([...shuffled(items, 1)].sort((a, b) => a - b)).toEqual(items);
    });

    it("is deterministic for the same seed", () => {
        expect(shuffled(items, 42)).toEqual(shuffled(items, 42));
    });

    it("orders differently for a different seed", () => {
        expect(shuffled(items, 1)).not.toEqual(shuffled(items, 2));
    });

    it("leaves the input untouched", () => {
        const original = [...items];
        shuffled(items, 7);
        expect(items).toEqual(original);
    });
});
