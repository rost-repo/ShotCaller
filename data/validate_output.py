# arquivo: data_scripts/validate_output.py
import json
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent                  
OUTPUT_DIR = ROOT_DIR / "web" / "public" / "data"

with open(OUTPUT_DIR / "index.json", encoding="utf-8") as f:
    index = json.load(f)

assert set(index.keys()) == {"season", "players", "leagueAverages", "leagueOverallFg"}
assert len(index["players"]) == 130, f"Esperava 130, veio {len(index['players'])}"

for p in index["players"]:
    assert all(k in p for k in ("id", "name", "team", "position", "age", "conference", "rookieYear", "height", "jersey"))

    with open(OUTPUT_DIR / "players" / f"{p['id']}.json", encoding="utf-8") as f:
        player_file = json.load(f)
    assert "name" not in player_file, "LEAKAGE, name should not be here."

    for hex_ in player_file["hexes"]:
        assert hex_["att"] >= hex_["made"] >= 0
        zone = hex_["zone"]
        assert zone in index["leagueAverages"] or zone == "Unknown Zone", \
            f"Zona '{zone}' não tem referência na liga nem fallback."

print("Artefatos válidos. ✔")
print(f"Jogadores: {len(index['players'])} | Zonas na liga: {len(index['leagueAverages'])}")