# arquivo: data_scripts/validate_output.py
import json
from pathlib import Path
import re

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent                  
PUBLIC_DATA_DIR = ROOT_DIR / "web" / "public" / "data"
PRIVATE_DATA_DIR = ROOT_DIR / "web" / "data"

with open(PUBLIC_DATA_DIR / "index.json", encoding="utf-8") as f:
    index = json.load(f)

assert set(index.keys()) == {"season", "players", "leagueAverages", "leagueOverallFg"}
assert len(index["players"]) == 130, f"Esperava 130, veio {len(index['players'])}"

for p in index["players"]:
    assert all(k in p for k in ("id", "name", "team", "position", "age", "conference", "rookieYear", "height", "jersey"))

    with open(PRIVATE_DATA_DIR / "players" / f"{p['id']}.json", encoding="utf-8") as f:
        player_file = json.load(f)
    assert "name" not in player_file, "LEAKAGE, name should not be here."

    for hex_ in player_file["hexes"]:
        assert hex_["att"] >= hex_["made"] >= 0
        zone = hex_["zone"]
        assert zone in index["leagueAverages"] or zone == "Unknown Zone", \
            f"Zona '{zone}' não tem referência na liga nem fallback."

print("Artefatos válidos. ✔")
print(f"Jogadores: {len(index['players'])} | Zonas na liga: {len(index['leagueAverages'])}")

with open(PRIVATE_DATA_DIR / "pools.json", encoding="utf-8") as f:
    pools = json.load(f)

assert isinstance(pools, list) and pools, "pools.json vazio ou mal formado"

known_ids = {p["id"] for p in index["players"]}
previous_from = ""

for pool in pools:
    assert set(pool.keys()) == {"from", "ids"}, f"chaves inesperadas em {pool.get('from')}"
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", pool["from"]), f"data mal formada: {pool['from']}"
    assert pool["from"] > previous_from, f"pools fora de ordem em {pool['from']}"
    previous_from = pool["from"]

    assert pool["ids"], f"pool {pool['from']} está vazio"
    assert len(pool["ids"]) == len(set(pool["ids"])), f"ids repetidos em {pool['from']}"

    missing = [i for i in pool["ids"] if i not in known_ids]
    assert not missing, f"pool {pool['from']} tem ids fora do índice: {missing}"