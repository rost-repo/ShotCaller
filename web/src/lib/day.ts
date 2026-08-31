// Tudo que deriva da data corrente vive aqui, e sempre em UTC.
// Misturar com horário local quebra a virada do dia — o servidor roda numa
// região que não é a sua, e o jogador está num fuso que não é o de nenhum dos dois.

export function dayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function seedForDay(day: string): number {
    return Number(day.replaceAll("-", ""));
}

// The game went live on this day; nothing before it was ever played.
export const FIRST_DAY = "2026-08-07";

export function isPlayableDay(day: string, today: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(day) && day >= FIRST_DAY && day <= today;
}

// Both sides are UTC midnight, so the difference is an exact number of days.
export function daysBetween(from: string, to: string): number {
    return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

export function monthOf(day: string): string {
    return day.slice(0, 7);
}

export function shiftMonth(month: string, delta: number): string {
    const [year, index] = month.split("-").map(Number);
    return new Date(Date.UTC(year, index - 1 + delta, 1)).toISOString().slice(0, 7);
}

// Sunday is 0, matching the weekday header order.
export function firstWeekday(month: string): number {
    return new Date(`${month}-01T00:00:00Z`).getUTCDay();
}

export function daysInMonth(month: string): string[] {
    const [year, index] = month.split("-").map(Number);
    const total = new Date(Date.UTC(year, index, 0)).getUTCDate();

    return Array.from({ length: total }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}
