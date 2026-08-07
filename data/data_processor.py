import math, statistics
from collections import Counter
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent                  

RAW_DIR = ROOT_DIR / "raw_data"
AVERAGES_DIR = ROOT_DIR / "league_averages"
PUBLIC_DATA_DIR = ROOT_DIR / "web" / "public" / "data"   # servido estaticamente ao navegador
PRIVATE_DATA_DIR = ROOT_DIR / "web" / "data"             # só o servidor lê
SHOTS_DIR = ROOT_DIR / "all_shots"

HEX_RADIUS = 7.5   # 0.75 feet
DX = HEX_RADIUS * 2 * math.sin(math.pi / 3)
DY = HEX_RADIUS * 1.5

MIN_ATTEMPTS_FOR_HEX_STATS = 3

SHOT_TYPES = ["Jump Shot", "Layup", "Pullup", "Floater", "Step Back", "Dunk", "Fadeaway", "Hook"]


#HEXAGONS FUNCTIONS
def hexagon_center(x, y):
    """Returns the center (cx, cy) for the hexagon from (x, y)."""
    row = round(y / DY)
    col = round(x / DX - (row % 2) / 2)
    best, best_dist = None, float("inf")
    for drow in (-1, 0, 1):
        for dcol in (-1, 0, 1):
            r, c = row + drow, col + dcol
            cx = (c + (r % 2) / 2) * DX
            cy = r * DY
            dist = (x - cx) ** 2 + (y - cy) ** 2
            if dist < best_dist:
                best, best_dist = (cx, cy), dist
    return best

def round_half_up(x):
    """Arredonda para o inteiro mais próximo, com .5 sempre para cima — equivalente ao Math.round() do JS."""
    return int(math.floor(x + 0.5))

def hexagon_id(x, y):
    """Returns the hexagon for a position (shot)"""
    cx, cy = hexagon_center(x, y)
    return f"{round_half_up(cx)},{round_half_up(cy)}"

def build_hex_zone_map(all_shots):
    """Pools all shots from the players to devide the zone for each hexagon by majority vote"""
    zone_votes = {}
    for player_shots in all_shots:
        for shot in player_shots:
            hid = hexagon_id(shot["LOC_X"], shot["LOC_Y"])
            zone = f"{shot['SHOT_ZONE_AREA']} | {shot['SHOT_ZONE_RANGE']}"
            if hid not in zone_votes:
                zone_votes[hid] = Counter()
            zone_votes[hid][zone] += 1
    return {hid: counter.most_common(1)[0][0] for hid, counter in zone_votes.items()}

def build_player_hexes(shots, hex_zone_map):
    "Groups the shots from a player into the hexagons, according to the hex zones"
    hexagons = {}
    for shot in shots:
        cx, cy = hexagon_center(shot["LOC_X"], shot["LOC_Y"])
        hid = f"{round_half_up(cx)},{round_half_up(cy)}"
        if hid not in hexagons:
            hexagons[hid] = {"cx": cx, "cy": cy, "att": 0, "made": 0}
        hexagons[hid]["att"] += 1
        hexagons[hid]["made"] += shot["SHOT_MADE_FLAG"]
    return [
        {**hexagon, "zone": hex_zone_map.get(key, "Unknown Zone")} for key, hexagon in hexagons.items()
    ]

def build_hex_league_stats(all_shots):
    hex_totals = {}
    for player_shots in all_shots:
        for shot in player_shots:
            hid = hexagon_id(shot["LOC_X"], shot["LOC_Y"])
            bucket = hex_totals.setdefault(hid, {"att": 0, "made": 0})
            bucket["att"] += 1
            bucket["made"] += shot["SHOT_MADE_FLAG"]

    hex_stats = {}
    for hid, totals in hex_totals.items():
        if totals["att"] < MIN_ATTEMPTS_FOR_HEX_STATS:
            continue
        mean = totals["made"] / totals["att"]
        hex_stats[hid] = {"mean": round(mean, 4), "n": totals["att"]}

    return hex_stats

def build_zone_types(shots, hex_zone_map):
    """Counts shots by type within each zone, for the zone tooltip."""
    zones = {}
    for shot in shots:
        cx, cy = hexagon_center(shot["LOC_X"], shot["LOC_Y"])
        hid = f"{round_half_up(cx)},{round_half_up(cy)}"
        zone = hex_zone_map.get(hid, "Unknown Zone")
        counts = zones.setdefault(zone, {})
        t = shot_type(shot["ACTION_TYPE"])
        counts[t] = counts.get(t, 0) + 1
    return zones

#FILE FUNCTIONS

def load_all_shots():
    file = json.loads((SHOTS_DIR / "all_shots.json").read_text(encoding="utf-8"))
    for player_shots in file:
        for shot in player_shots:
            shot["LOC_X"] = -shot["LOC_X"]
    return file

def load_raw_players():
    files = [f for f in RAW_DIR.glob("*.json")]
    players = [json.loads(f.read_text(encoding="utf-8")) for f in files]
    for player in players:
            for shot in player["shots"]:
                shot["LOC_X"] = -shot["LOC_X"]
    return players

def build_league_averages():
    raw = json.loads((AVERAGES_DIR / "league_averages.json").read_text(encoding="utf-8"))
    averages = {}
    total_fga = total_fgm = 0
    for row in raw:
        zone = f"{row['SHOT_ZONE_AREA']} | {row['SHOT_ZONE_RANGE']}"
        averages[zone] = row["FG_PCT"]
        total_fga += row["FGA"]
        total_fgm += row["FGM"]
    overall = round(total_fgm / total_fga, 4) if total_fga else 0.0
    return averages, overall

#INFO FUNCTIONS

def _age_from_birthdate(birthdate_str):
    from datetime import datetime
    if not birthdate_str:
        return None
    born = datetime.fromisoformat(birthdate_str)
    today = datetime.now()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))

def _conference_from_team(abbreviation):
    EAST = {"BOS", "BKN", "NYK", "PHI", "TOR", "CHI", "CLE", "DET", "IND",
            "MIL", "ATL", "CHA", "MIA", "ORL", "WAS"}
    return "East" if abbreviation in EAST else "West"

def _division_from_team(abbreviation):
    DIVISIONS = {
        "Atlantic":  {"BOS", "BKN", "NYK", "PHI", "TOR"},
        "Central":   {"CHI", "CLE", "DET", "IND", "MIL"},
        "Southeast": {"ATL", "CHA", "MIA", "ORL", "WAS"},
        "Northwest": {"DEN", "MIN", "OKC", "POR", "UTA"},
        "Pacific":   {"GSW", "LAC", "LAL", "PHX", "SAC"},
        "Southwest": {"DAL", "HOU", "MEM", "NOP", "SAS"},
    }
    for division, teams in DIVISIONS.items():
        if abbreviation in teams:
            return division
    return None

def _player_summary(raw):
    info = raw["info"]
    stats = raw["season_stats"]
    return {
        "id": raw["id"],
        "name": raw["name"],
        "team": info.get("TEAM_ABBREVIATION"),
        "position": info.get("POSITION"),
        "age": _age_from_birthdate(info.get("BIRTHDATE")),
        "division": _division_from_team(info.get("TEAM_ABBREVIATION")),
        "conference": _conference_from_team(info.get("TEAM_ABBREVIATION")),
        "rookieYear": info.get("FROM_YEAR"),
        "height" : info.get("HEIGHT"),
        "jersey" : info.get("JERSEY"),
        "stats": {
            "pts": stats.get("PTS"),
            "ast": stats.get("AST"),
            "reb": stats.get("REB"),},
    }

def shot_type(action_type):
    """Groups the raw ACTION_TYPE values into eight categories.
    Order matters: more specific qualifiers are checked before generic ones."""
    a = action_type.lower()
    if "dunk" in a:      return "Dunk"
    if "layup" in a:     return "Layup"
    if "hook" in a:      return "Hook"
    if "float" in a:     return "Floater"
    if "step back" in a: return "Step Back"
    if "fadeaway" in a:  return "Fadeaway"
    if "pullup" in a or "pull-up" in a: return "Pullup"
    return "Jump Shot"

def main():
    raw_players = load_raw_players()
    league_averages, league_overall = build_league_averages()
    
    all_shots = load_all_shots()
    hex_zone_map = build_hex_zone_map(all_shots)
    hex_league_stats = build_hex_league_stats(all_shots)

    players_dir = PRIVATE_DATA_DIR / "players"
    players_dir.mkdir(parents=True, exist_ok=True)
    PUBLIC_DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    index_players = []

    for raw in raw_players:
        index_players.append(_player_summary(raw))
        hexes = build_player_hexes(raw["shots"], hex_zone_map)
        zone_types = build_zone_types(raw["shots"], hex_zone_map)
        with open(players_dir / f"{raw['id']}.json", "w", encoding="utf-8") as f:
            json.dump({"id": raw["id"], "hexes": hexes, "zoneTypes": zone_types}, f)
    
    with open(PUBLIC_DATA_DIR / "hex_stats.json", "w", encoding="utf-8") as f:
        json.dump(hex_league_stats, f)    
    
    index = {
        "season": "2025-26",
        "players": index_players,
        "leagueAverages": league_averages,
        "leagueOverallFg": league_overall
    }
    
    with open(PUBLIC_DATA_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f)
    
if __name__  == "__main__":
    main()