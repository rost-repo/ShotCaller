import json
import time
from pathlib import Path
import re
from nba_api.stats.endpoints import leagueleaders, shotchartdetail, commonplayerinfo
import pandas as pd

SEASON = "2025-26"

MIN_GAMES_FOR_POOL = 30 
POOL_SIZE = 130
RAW_DIR = Path("raw_data")

def get_top_players():
    """Returns the top130 players for the season."""
    leaders = leagueleaders.LeagueLeaders(
        season=SEASON,
        season_type_all_star="Regular Season",
        stat_category_abbreviation="PTS",
    )
    df = leaders.get_data_frames()[0]
    df.sort_values("PTS", ascending=False)
    df = df[df["GP"] >= MIN_GAMES_FOR_POOL][:POOL_SIZE]
    return df.to_dict("records")

def get_player_info(player_id):
    """Returns player profile info."""
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    df = info.get_data_frames()[0]
    return df.to_dict("records")[0]

def get_player_shots(player_id):
    """Busca todos os arremessos de quadra do jogador na temporada."""    
    shots = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=player_id,
        season_nullable=SEASON,
        season_type_all_star="Regular Season",
        context_measure_simple="FGA",  
    )
    df = shots.get_data_frames()[0]
    return df.to_dict("records")

def get_league_averages():
    averages = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=1, #ANY ID WORKS FOR THIS
        season_nullable=SEASON,
        season_type_all_star="Regular Season",
        context_measure_simple="FGA",  
    )
    df = averages.get_data_frames()[1]
    return df.to_dict("records")

def slugify(name):
    """'Nikola Jokić' -> 'nikola-joki'"""
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"\s+", "-", slug.strip())
    return slug


def fetch_player_data(player, max_attempts=3):
    """Fetches player info + shot attempts."""
    for attempt in range(max_attempts):
        try:
            return {
                "id": player["PLAYER_ID"],
                "name": player["PLAYER"],
                "season_stats": player, #Not exactly season stats, and it is currently not used, but saving since we already fetch this data anyway
                "info": get_player_info(player["PLAYER_ID"]),
                "shots": get_player_shots(player["PLAYER_ID"]),
            }
        except Exception as error:
            wait = 10 * (attempt + 1)   # backoff: espera cada vez mais
            print(f"  Attempt {attempt + 1} failed ({error}). Waiting {wait}...")
            time.sleep(wait)
    return None 

def collect_all():
    RAW_DIR.mkdir(exist_ok=True)

    players = get_top_players()
    league_file = RAW_DIR / "league_averages.json"
    failed = []

    if not league_file.exists():
        averages = get_league_averages()
        with open(league_file, "w", encoding="utf-8") as f:
            json.dump(averages, f)
    else:
        pass
    
    for index, player in enumerate(players, start=1):
        out_file = RAW_DIR / f"{slugify(player['PLAYER'])}-{player['PLAYER_ID']}.json"
        if out_file.exists():
            print(f"{player['PLAYER']} file already exists...")
            continue
        
        print(f"[{index}/{len(players)}] Downloading {player['PLAYER']}...")
        
        data = fetch_player_data(player)
        if data is None:
            failed.append(player["PLAYER"])
            continue
        
        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f)        
        time.sleep(1.5)   # pausa educada entre jogadores
    if failed:
        print(f"\\nFailed: {failed}")
    else:
        print("\\nFetching completed without fails.")

if __name__ == "__main__":
    collect_all()
    