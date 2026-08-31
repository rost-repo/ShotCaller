# arquivo: data_scripts/validate_output.py
import json
import sys
from pathlib import Path
from datetime import datetime, timezone
from collections import defaultdict
import re

SCRIPT_DIR = Path(__file__).resolve().parent
ROOT_DIR = SCRIPT_DIR.parent
PUBLIC_SEASONS_DIR = ROOT_DIR / "web" / "public" / "data" / "seasons"
PRIVATE_SEASONS_DIR = ROOT_DIR / "web" / "data" / "seasons"
POOLS_FILE = ROOT_DIR / "web" / "data" / "pools.json"

# Console defaults to cp1252 on Windows; the check mark needs UTF-8.
sys.stdout.reconfigure(encoding="utf-8")

# UTC, to match the day key the game runs on.
TODAY = datetime.now(timezone.utc).strftime("%Y-%m-%d")

with open(POOLS_FILE, encoding="utf-8") as f:
    pools = json.load(f)

assert isinstance(pools, list) and pools, "pools.json vazio ou mal formado"

previous_from = ""
required_ids = defaultdict(set)

for pool in pools:
    assert set(pool.keys()) == {"from", "season", "ids"}, f"chaves inesperadas em {pool.get('from')}"
    assert re.fullmatch(r"\d{4}-\d{2}-\d{2}", pool["from"]), f"data mal formada: {pool['from']}"
    # A future pool activates with no deploy, stranding the prerendered page on the old season.
    assert pool["from"] <= TODAY, f"pool {pool['from']} começa no futuro"
    assert pool["from"] > previous_from, f"pools fora de ordem em {pool['from']}"
    previous_from = pool["from"]

    assert pool["ids"], f"pool {pool['from']} está vazio"
    assert len(pool["ids"]) == len(set(pool["ids"])), f"ids repetidos em {pool['from']}"

    required_ids[pool["season"]].update(pool["ids"])


def validate_season(season, needed):
    index_file = PUBLIC_SEASONS_DIR / season / "index.json"
    assert index_file.exists(), f"temporada {season} não tem index.json"

    with open(index_file, encoding="utf-8") as f:
        index = json.load(f)

    assert set(index.keys()) == {"season", "players", "leagueAverages", "leagueOverallFg"}
    assert index["season"] == season, f"index diz {index['season']}, pasta diz {season}"
    assert len(index["players"]) == 130, f"Esperava 130, veio {len(index['players'])}"

    known_ids = {p["id"] for p in index["players"]}
    missing = sorted(needed - known_ids)
    assert not missing, f"temporada {season} não cobre ids do pool: {missing}"

    for p in index["players"]:
        assert all(k in p for k in ("id", "name", "team", "position", "age", "conference", "rookieYear", "height", "jersey"))

        with open(PRIVATE_SEASONS_DIR / season / "players" / f"{p['id']}.json", encoding="utf-8") as f:
            player_file = json.load(f)
        assert "name" not in player_file, "LEAKAGE, name should not be here."

        for hex_ in player_file["hexes"]:
            assert hex_["att"] >= hex_["made"] >= 0
            zone = hex_["zone"]
            assert zone in index["leagueAverages"] or zone == "Unknown Zone", \
                f"Zona '{zone}' não tem referência na liga nem fallback."

    return len(index["players"]), len(index["leagueAverages"])


for season in sorted(required_ids):
    n_players, n_zones = validate_season(season, required_ids[season])
    print(f"{season}: {n_players} jogadores | {n_zones} zonas na liga")

for pool in pools:
    print(f"pool desde {pool['from']}: {len(pool['ids'])} ids da temporada {pool['season']}")

print("Artefatos válidos. ✔")
