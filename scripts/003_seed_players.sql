-- Script de jugadores para Liga 33 - Copa Libertadores
-- Versión: 1.0
-- Fecha: 2025-01-29

-- Jugadores de Deportivo Central
INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Juan Martínez', '12345678', 28, 1, 0, 1, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Pedro Sánchez', '23456789', 25, 2, 2, 3, 0, true
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Luis García', '34567890', 27, 3, 1, 2, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Carlos Rodríguez', '45678901', 29, 4, 0, 1, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Miguel Torres', '56789012', 24, 5, 3, 1, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Diego López', '67890123', 26, 6, 5, 2, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Roberto Fernández', '78901234', 23, 7, 4, 0, 1, true
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Andrés Gómez', '89012345', 25, 8, 2, 1, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Fernando Silva', '90123456', 27, 9, 12, 2, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Sebastián Ruiz', '01234567', 24, 10, 8, 1, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Martín Díaz', '11223344', 22, 11, 6, 0, 0, false
FROM teams t WHERE t.name = 'Deportivo Central'
ON CONFLICT (cedula) DO NOTHING;

-- Jugadores de Racing FC
INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Jorge Ramírez', '22334455', 30, 1, 0, 0, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Pablo Castro', '33445566', 26, 2, 1, 2, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Javier Morales', '44556677', 28, 3, 0, 1, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Ricardo Vega', '55667788', 27, 4, 2, 0, 1, true
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Alejandro Núñez', '66778899', 25, 5, 4, 1, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Gustavo Herrera', '77889900', 24, 6, 3, 2, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Raúl Mendoza', '88990011', 26, 7, 5, 0, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Eduardo Paredes', '99001122', 23, 8, 2, 1, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Miguel Santos', '10112233', 28, 9, 10, 2, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Daniel Ortiz', '21223344', 25, 10, 7, 1, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, age, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Cristian Rojas', '32334455', 24, 11, 5, 2, 0, false
FROM teams t WHERE t.name = 'Racing FC'
ON CONFLICT (cedula) DO NOTHING;
