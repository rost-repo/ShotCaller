// Tudo que deriva da data corrente vive aqui, e sempre em UTC.
// Misturar com horário local quebra a virada do dia — o servidor roda numa
// região que não é a sua, e o jogador está num fuso que não é o de nenhum dos dois.

export function dayKey(date = new Date()): string {
    return date.toISOString().slice(0, 10);
}

export function dailySeed(date = new Date()): number {
    return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
}
