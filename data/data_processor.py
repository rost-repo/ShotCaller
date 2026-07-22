import math
from collections import Counter
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent                  

RAW_DIR = ROOT_DIR / "raw_data"
AVERAGES_DIR = ROOT_DIR / "league_averages"
OUTPUT_DIR = ROOT_DIR / "web" / "public" / "data"

HEX_RADIUS = 7.5   # 0.75 feet
DX = HEX_RADIUS * 2 * math.sin(math.pi / 3)
DY = HEX_RADIUS * 1.5



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

def hexagon_id(x, y):
    """Returns the hexagon for a position (shot)"""
    cx, cy = hexagon_center(x, y)
    return f"{round(cx)},{round(cy)}"

def build_hex_zone_map(all_shots):
    """Pools all shots from the players to devide the zone for each hexagon by majority vote"""
    zone_votes = {}
    for shot in all_shots:
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
        hid = f"{round(cx)},{round(cy)}"
        if hid not in hexagons:
            hexagons[hid] = {"cx": cx, "cy": cy, "att": 0, "made": 0}
        hexagons[hid]["att"] += 1
        hexagons[hid]["made"] += shot["SHOT_MADE_FLAG"]
    return [
        {**hexagon, "zone": hex_zone_map.get(key, "Unknown Zone")} for key, hexagon in hexagons.items()
    ]

#FILE FUNCTIONS
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

def _player_summary(raw):
    info = raw["info"]
    return {
        "id": raw["id"],
        "name": raw["name"],
        "team": info.get("TEAM_ABBREVIATION"),
        "position": info.get("POSITION"),
        "age": _age_from_birthdate(info.get("BIRTHDATE")),
        "conference": _conference_from_team(info.get("TEAM_ABBREVIATION")),
        "rookieYear": info.get("FROM_YEAR"),
        "height" : info.get("HEIGHT"),
        "jersey" : info.get("JERSEY"),
    }

def main():
    raw_players = load_raw_players()
    league_averages, league_overall = build_league_averages()
    
    all_shots = [shot for p in raw_players for shot in p["shots"]]
    hex_zone_map = build_hex_zone_map(all_shots)
    
    players_dir = OUTPUT_DIR / "players"
    players_dir.mkdir(parents=True, exist_ok=True)
    
    index_players = []
    
    for raw in raw_players:
        index_players.append(_player_summary(raw))
        hexes = build_player_hexes(raw["shots"], hex_zone_map)
        with open(players_dir / f"{raw['id']}.json", "w", encoding="utf-8") as f:
            json.dump({"id": raw["id"], "hexes": hexes}, f)
    
    index = {
        "season": "2025-26",
        "players": index_players,
        "leagueAverages": league_averages,
        "leagueOverallFg": league_overall
    }
    
    with open(OUTPUT_DIR / "index.json", "w", encoding="utf-8") as f:
        json.dump(index, f)
    
if __name__  == "__main__":
    main()