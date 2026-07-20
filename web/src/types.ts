export interface Hex {
    cx: number;
    cy: number
    att: number;
    made: number;
    zone: string;
}

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
}

export interface GameIndex {
    season: string;
    players : PlayerSummary[];
    leagueAverages: Record<string, number>;
    leagueOverallFg: number;
}
