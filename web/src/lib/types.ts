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

export interface PlayerHexes {
    id: number;
    hexes: Hex[];
}

export interface PlayerSummary {
    id: number;
    name: string;
    team: string;
    position: string;
    age: number; 
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
