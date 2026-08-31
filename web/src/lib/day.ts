// Tudo que deriva da data corrente vive aqui, e sempre em UTC.
// Misturar com horário local quebra a virada do dia — o servidor roda numa
// região que não é a sua, e o jogador está num fuso que não é o de nenhum dos dois.

export function dayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function seedForDay(day: string): number {
    return Number(day.replaceAll("-", ""));
}

// Both sides are UTC midnight, so the difference is an exact number of days.
export function daysBetween(from: string, to: string): number {
    return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}