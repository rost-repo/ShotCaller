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

// Fisher-Yates, seeded. Same seed always yields the same order.
export function shuffled<T>(items: T[], seed: number): T[] {
    const out = [...items];
    const rand = mulberry32(seed);

    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }

    return out;
}

export function randomSeed(): number {
    return Math.floor(Math.random() * 2 ** 31)
}
