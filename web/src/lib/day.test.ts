import { describe, it, expect } from "vitest";
import { daysBetween, seedForDay, monthOf, shiftMonth, firstWeekday, daysInMonth } from "./day";

describe("daysBetween", () => {
    it("is zero for the same day", () => {
        expect(daysBetween("2026-08-31", "2026-08-31")).toBe(0);
    });

    it("counts consecutive days", () => {
        expect(daysBetween("2026-08-31", "2026-09-01")).toBe(1);
    });

    it("crosses a leap day", () => {
        expect(daysBetween("2028-02-28", "2028-03-01")).toBe(2);
    });

    it("goes negative when the order is reversed", () => {
        expect(daysBetween("2026-09-01", "2026-08-31")).toBe(-1);
    });
});

describe("seedForDay", () => {
    it("packs the date into a number", () => {
        expect(seedForDay("2026-08-31")).toBe(20260831);
    });
});

describe("calendar helpers", () => {
    it("takes the month of a day", () => {
        expect(monthOf("2026-08-31")).toBe("2026-08");
    });

    it("shifts across a year boundary", () => {
        expect(shiftMonth("2026-01", -1)).toBe("2025-12");
        expect(shiftMonth("2026-12", 1)).toBe("2027-01");
    });

    it("knows the weekday a month starts on", () => {
        expect(firstWeekday("2026-08")).toBe(6);
    });

    it("lists every day of a month", () => {
        const august = daysInMonth("2026-08");
        expect(august).toHaveLength(31);
        expect(august[0]).toBe("2026-08-01");
        expect(august.at(-1)).toBe("2026-08-31");
    });

    it("handles February in a leap year", () => {
        expect(daysInMonth("2028-02")).toHaveLength(29);
    });
});
