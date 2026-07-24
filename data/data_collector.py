import json
import time
from pathlib import Path
import re
from nba_api.stats.endpoints import leagueleaders, shotchartdetail, commonplayerinfo
import pandas as pd
import argparse

SEASON = "2025-26"

MIN_GAMES_FOR_POOL = 30 
POOL_SIZE = 130
RAW_DIR = Path("raw_data")
AVERAGES_DIR = Path("league_averages")
SHOTS_DIR = Path("all_shots")


def parse_args():
    parser = argparse.ArgumentParser(description="Collects the data for the NBA Players.")
    parser.add_argument(
        "--retry-failed",
        action="store_true",
        help="Retry's failed players.",
    )
    return parser.parse_args()


def get_all_players():
    """Returns the all the players for the season."""
    leaders = leagueleaders.LeagueLeaders(
        season=SEASON,
        season_type_all_star="Regular Season",
        stat_category_abbreviation="PTS",
    )
    df = leaders.get_data_frames()[0]
    df = df.sort_values("PTS", ascending=False)
    return df



def get_player_info(player_id):
    """Returns player profile info."""
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    df_info = info.get_data_frames()[0]
    df_stats = info.get_data_frames()[1]
    return df_info.to_dict("records")[0], df_stats.to_dict("records")[0]

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
    df = df[['LOC_X', 'LOC_Y', "SHOT_MADE_FLAG", "SHOT_ZONE_BASIC", "SHOT_ZONE_AREA", "SHOT_ZONE_RANGE", 'ACTION_TYPE']]
    return df.to_dict("records")

def get_zone_league_averages():
    averages = shotchartdetail.ShotChartDetail(
        team_id=0,
        player_id=1, #ANY ID WORKS FOR THIS
        season_nullable=SEASON,
        season_type_all_star="Regular Season",
        context_measure_simple="FGA",  
    )
    df = averages.get_data_frames()[1]
    return df.to_dict("records")

def collect_shots(players, max_attempts=3):
    """Gets all player shots and creates a json file with them"""
    total = len(players)
    all_shots = []
    for index, player in enumerate(players, start=1):
        print(f"[{index}/{total}] Fetching shots for {player['PLAYER']}...")
        for attempt in range(max_attempts):
            try:
                player_shots = get_player_shots(player["PLAYER_ID"])
                all_shots.append(player_shots)
                break
            except Exception as error:
                wait = 10 * (attempt + 1)   # backoff
                print(f"  {player['PLAYER']}: attempt {attempt + 1} failed ({error}). Waiting {wait}...")
                time.sleep(wait)
        time.sleep(1.5)
    return all_shots

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
            info, stats = get_player_info(player["PLAYER_ID"])
            return {
                "id": player["PLAYER_ID"],
                "name": player["PLAYER"],
                "season_stats": stats, #Not exactly season stats, and it is currently not used, but saving since we already fetch this data anyway
                "info": info,
                "shots": get_player_shots(player["PLAYER_ID"]),
            }
        except Exception as error:
            wait = 10 * (attempt + 1)   # backoff
            print(f"  Attempt {attempt + 1} failed ({error}). Waiting {wait}...")
            time.sleep(wait)
    return None 

def collect_players(players):
    """Baixa uma lista de jogadores; devolve os que falharam definitivamente."""
    failed = []
    total = len(players)
    for index, player in enumerate(players, start=1):
        out_file = RAW_DIR / f"{slugify(player['PLAYER'])}-{player['PLAYER_ID']}.json"
        if out_file.exists():
            #print(f"{player['PLAYER']} file already exists...") #DEBUG
            continue

        print(f"[{index}/{total}] Downloading {player['PLAYER']}...")
        data = fetch_player_data(player)
        if data is None:
            print(f"{player['PLAYER']} failed...")
            failed.append(player) 
            continue

        with open(out_file, "w", encoding="utf-8") as f:
            json.dump(data, f)
        time.sleep(1.5)
    return failed


def collect_all(retry_failed=False): 
    RAW_DIR.mkdir(exist_ok=True)
    AVERAGES_DIR.mkdir(exist_ok=True)
    SHOTS_DIR.mkdir(exist_ok=True)
    

    df_players = get_all_players()
    all_players = df_players.to_dict("records")
    df_top_players = df_players[df_players["GP"] >= MIN_GAMES_FOR_POOL][:POOL_SIZE]
    top_players = df_top_players.to_dict("records")
    league_file = AVERAGES_DIR / "league_averages.json"
    shots_file = SHOTS_DIR / "all_shots.json"

    
    if not league_file.exists():
        averages = get_zone_league_averages()
        with open(league_file, "w", encoding="utf-8") as f:
            json.dump(averages, f)
    
    if not shots_file.exists():
        shots = collect_shots(all_players)
        with open(shots_file, "w", encoding="utf-8") as f:
            json.dump(shots, f)
        
    failed = collect_players(top_players)

    if failed and retry_failed:
        print(f"\nRefazendo {len(failed)} jogador(es) que falharam...")
        failed = collect_players(failed)   # segunda passada, só nos que sobraram

    if failed:
        print(f"\nFalharam definitivamente: {[p['PLAYER'] for p in failed]}")
    else:
        print("\nColeta completa, sem falhas.")

if __name__ == "__main__":
    args = parse_args()
    collect_all(retry_failed=args.retry_failed)
