export interface Hex {
    cx: number;
    cy: number
    att: number;
    made: number;
    zone: string;
}

export interface HexLeagueStat {
    mean: number;
    n: number;
}

export type HexStats = Record<string, HexLeagueStat>;


export type ZoneTypes = Record<string, Record<string, number>>;
export interface PlayerHexes {
    id: number;
    hexes: Hex[];
    zoneTypes: ZoneTypes
}

export interface PlayerSummary {
    id: number;
    name: string;
    team: string;
    position: string;
    age: number; 
    division: string;
    conference: string;
    rookieYear: number;
    jersey: string;
    height: string;
    stats: {
        pts: number;
        ast: number;
        reb: number;
    };
}

export interface GameIndex {
    season: string;
    players : PlayerSummary[];
    leagueAverages: Record<string, number>;
    leagueOverallFg: number;
}

// Day -> score: guesses used when won, "X" when lost.
export type ArchiveResults = Record<string, number | "X">;

export interface Stats {
    played: number;
    currentStreak: number;
    maxStreak: number;
    distribution: number[];
    lastCompletedDay: string | null;
}