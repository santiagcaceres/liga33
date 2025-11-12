-- Crear grupo para SuperLiga Femenina y asignar todos los equipos
-- Este script asigna todos los equipos del torneo femenino a un grupo único

-- Primero, alterar la constraint para permitir 'F' además de 'A', 'B', 'C'
ALTER TABLE copa_groups DROP CONSTRAINT IF EXISTS copa_groups_name_check;
ALTER TABLE copa_groups ADD CONSTRAINT copa_groups_name_check CHECK (name IN ('A', 'B', 'C', 'F'));

-- Insertar grupo 'F' para SuperLiga Femenina
INSERT INTO copa_groups (name, tournament_id)
VALUES ('F', 2)
ON CONFLICT DO NOTHING;

-- Asignar todos los equipos femeninos al grupo 'F'
INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT 
  t.id as team_id,
  cg.id as group_id,
  0 as played,
  0 as won,
  0 as drawn,
  0 as lost,
  0 as goals_for,
  0 as goals_against,
  0 as goal_difference,
  0 as points
FROM teams t
CROSS JOIN copa_groups cg
WHERE t.tournament_id = 2 
  AND cg.name = 'F'
  AND cg.tournament_id = 2
ON CONFLICT (team_id, group_id) DO NOTHING;
