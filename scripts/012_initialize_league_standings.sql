-- Script para inicializar league_standings para la SuperLiga Femenina
-- Eliminar registros existentes para evitar duplicados
DELETE FROM league_standings WHERE tournament_id = 2;

-- Insertar todos los equipos femeninos en league_standings
INSERT INTO league_standings (team_id, tournament_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT 
  t.id,
  2 as tournament_id,
  0 as played,
  0 as won,
  0 as drawn,
  0 as lost,
  0 as goals_for,
  0 as goals_against,
  0 as goal_difference,
  0 as points
FROM teams t
WHERE t.tournament_id = 2
ON CONFLICT DO NOTHING;

-- Crear función para actualizar league_standings automáticamente
CREATE OR REPLACE FUNCTION update_league_standing(
  p_team_id INTEGER,
  p_tournament_id INTEGER,
  p_won INTEGER,
  p_drawn INTEGER,
  p_lost INTEGER,
  p_goals_for INTEGER,
  p_goals_against INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE league_standings
  SET 
    played = played + 1,
    won = won + p_won,
    drawn = drawn + p_drawn,
    lost = lost + p_lost,
    goals_for = goals_for + p_goals_for,
    goals_against = goals_against + p_goals_against,
    goal_difference = (goals_for + p_goals_for) - (goals_against + p_goals_against),
    points = points + (p_won * 3) + (p_drawn * 1)
  WHERE team_id = p_team_id AND tournament_id = p_tournament_id;
END;
$$ LANGUAGE plpgsql;
