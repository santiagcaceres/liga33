-- Jugadoras del equipo Pink Panther - SuperLiga Femenina

-- Removed age field from all INSERT statements since the column was dropped

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Lorena Rodríguez', '55522952', 1, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Yessica Pereira', '56406757', 2, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Abril Quevedo', '54941218', 3, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Martina Espinel', '52080874', 4, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Fernanda Velazco', '55577850', 5, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Catherin Almenares', '50248597', 6, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Victoria Ocampo', '49476167', 7, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Bettina Vargas', '47308803', 8, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Cintia Rodriguez', '47333868', 9, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Camila Gonzalez', '50814801', 10, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Valeria Vico', '55967598', 11, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Paula Cafasso', '51426366', 12, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Sol Ponce De León', '53004269', 13, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Sofia Tort', '56410198', 14, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;

INSERT INTO players (team_id, name, cedula, number, goals, yellow_cards, red_cards, suspended)
SELECT t.id, 'Micaela Marquisio', '47700031', 15, 0, 0, 0, false
FROM teams t WHERE t.name = 'Pink Panther' AND t.tournament_id = 2
ON CONFLICT (cedula) DO NOTHING;
