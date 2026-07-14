import json
import time
from pathlib import Path

from nba_api.stats.endpoints import leagueleaders, shotchartdetail, commonplayerinfo
import pandas as pd

SEASON = "2025-26"
POOL_FILE = Path("top130.json")

MIN_GAMES_FOR_POOL = 30     # critério do POOL DO JOGO, não da coleta
POOL_SIZE = 130


def get_top_players():
    """Retorna TODOS os jogadores com estatísticas na temporada."""
    leaders = leagueleaders.LeagueLeaders(
        season=SEASON,
        season_type_all_star="Regular Season",
        stat_category_abbreviation="PTS",
    )
    df = leaders.get_data_frames()[0]
    df = df[df["GP"] >= MIN_GAMES_FOR_POOL][:POOL_SIZE]
    return df.to_dict("records")

def get_player_info(player_id):
    """Busca dados de perfil: nome, time, posição, data de nascimento etc."""
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
        player_id=1,
        season_nullable=SEASON,
        season_type_all_star="Regular Season",
        context_measure_simple="FGA",  
    )
    df = averages.get_data_frames()[1]
    return df.to_dict("records")

