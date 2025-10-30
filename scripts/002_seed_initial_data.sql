-- Script de datos iniciales para Liga 33 - Copa Libertadores
-- Versión: 1.0
-- Fecha: 2025-01-29

-- Insertar grupos
INSERT INTO copa_groups (name) VALUES ('A'), ('B'), ('C')
ON CONFLICT (name) DO NOTHING;

-- Insertar equipos
INSERT INTO teams (name, coach) VALUES
  ('Deportivo Central', 'Juan Pérez'),
  ('Racing FC', 'Carlos Gómez'),
  ('Boca Local', 'Miguel Rodríguez'),
  ('San Lorenzo', 'Diego Martínez'),
  ('Club Atlético Unidos', 'Roberto Silva'),
  ('Independiente Sur', 'Fernando López'),
  ('River Regional', 'Andrés Torres'),
  ('Estudiantes', 'Pablo Castro'),
  ('Peñarol FC', 'Luis Fernández'),
  ('Nacional', 'Jorge Ramírez'),
  ('Defensor', 'Sebastián Ruiz'),
  ('Cerro', 'Martín Díaz')
ON CONFLICT (name) DO NOTHING;

-- Asignar equipos a grupos
-- Grupo A
INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 3, 0, 0, 8, 2, 6, 9
FROM teams t, copa_groups g
WHERE t.name = 'Deportivo Central' AND g.name = 'A'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 2, 0, 1, 6, 4, 2, 6
FROM teams t, copa_groups g
WHERE t.name = 'Racing FC' AND g.name = 'A'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 1, 0, 2, 4, 6, -2, 3
FROM teams t, copa_groups g
WHERE t.name = 'Boca Local' AND g.name = 'A'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 0, 0, 3, 2, 8, -6, 0
FROM teams t, copa_groups g
WHERE t.name = 'San Lorenzo' AND g.name = 'A'
ON CONFLICT (team_id, group_id) DO NOTHING;

-- Grupo B
INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 2, 1, 0, 7, 3, 4, 7
FROM teams t, copa_groups g
WHERE t.name = 'Club Atlético Unidos' AND g.name = 'B'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 2, 0, 1, 5, 3, 2, 6
FROM teams t, copa_groups g
WHERE t.name = 'Independiente Sur' AND g.name = 'B'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 1, 1, 1, 4, 4, 0, 4
FROM teams t, copa_groups g
WHERE t.name = 'River Regional' AND g.name = 'B'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 0, 0, 3, 1, 7, -6, 0
FROM teams t, copa_groups g
WHERE t.name = 'Estudiantes' AND g.name = 'B'
ON CONFLICT (team_id, group_id) DO NOTHING;

-- Grupo C
INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 2, 1, 0, 6, 2, 4, 7
FROM teams t, copa_groups g
WHERE t.name = 'Peñarol FC' AND g.name = 'C'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 2, 0, 1, 5, 3, 2, 6
FROM teams t, copa_groups g
WHERE t.name = 'Nacional' AND g.name = 'C'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 1, 0, 2, 3, 5, -2, 3
FROM teams t, copa_groups g
WHERE t.name = 'Defensor' AND g.name = 'C'
ON CONFLICT (team_id, group_id) DO NOTHING;

INSERT INTO team_groups (team_id, group_id, played, won, drawn, lost, goals_for, goals_against, goal_difference, points)
SELECT t.id, g.id, 3, 0, 1, 2, 2, 6, -4, 1
FROM teams t, copa_groups g
WHERE t.name = 'Cerro' AND g.name = 'C'
ON CONFLICT (team_id, group_id) DO NOTHING;
