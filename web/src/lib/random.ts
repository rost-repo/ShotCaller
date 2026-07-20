export function mulberry32(seed: number): () => number {
    return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

export function pickPlayerIndex(count: number, seed: number): number {
    return Math.floor(mulberry32(seed)() * count)
}

export function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31)
}

export function dailySeed(date = new Date()): number {
    return date.getUTCFullYear() * 10000 + (date.getUTCMonth() + 1) * 100 + date.getUTCDate();
} 