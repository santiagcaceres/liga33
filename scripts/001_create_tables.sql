-- Script de creación de tablas para Liga 33 - Copa Libertadores
-- Versión: 1.0
-- Fecha: 2025-01-29

-- Tabla de equipos
CREATE TABLE IF NOT EXISTS teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  coach VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de jugadores
CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  age INTEGER NOT NULL CHECK (age >= 16 AND age <= 50),
  number INTEGER NOT NULL CHECK (number >= 1 AND number <= 99),
  goals INTEGER DEFAULT 0,
  yellow_cards INTEGER DEFAULT 0,
  red_cards INTEGER DEFAULT 0,
  suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(team_id, number)
);

-- Tabla de grupos de la Copa Libertadores
CREATE TABLE IF NOT EXISTS copa_groups (
  id SERIAL PRIMARY KEY,
  name VARCHAR(1) NOT NULL UNIQUE CHECK (name IN ('A', 'B', 'C')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de equipos en grupos
CREATE TABLE IF NOT EXISTS team_groups (
  id SERIAL PRIMARY KEY,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  group_id INTEGER NOT NULL REFERENCES copa_groups(id) ON DELETE CASCADE,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  UNIQUE(team_id, group_id)
);

-- Tabla de partidos
CREATE TABLE IF NOT EXISTS matches (
  id SERIAL PRIMARY KEY,
  round INTEGER NOT NULL,
  group_id INTEGER REFERENCES copa_groups(id) ON DELETE SET NULL,
  home_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  home_score INTEGER,
  away_score INTEGER,
  match_date DATE NOT NULL,
  played BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de goles
CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  minute INTEGER NOT NULL CHECK (minute >= 1 AND minute <= 120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de tarjetas
CREATE TABLE IF NOT EXISTS cards (
  id SERIAL PRIMARY KEY,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  card_type VARCHAR(10) NOT NULL CHECK (card_type IN ('yellow', 'red')),
  minute INTEGER NOT NULL CHECK (minute >= 1 AND minute <= 120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de sorteos (para registrar los cruces de octavos)
CREATE TABLE IF NOT EXISTS draws (
  id SERIAL PRIMARY KEY,
  team1_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  match_number INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_cedula ON players(cedula);
CREATE INDEX IF NOT EXISTS idx_matches_round ON matches(round);
CREATE INDEX IF NOT EXISTS idx_matches_group ON matches(group_id);
CREATE INDEX IF NOT EXISTS idx_goals_match ON goals(match_id);
CREATE INDEX IF NOT EXISTS idx_goals_player ON goals(player_id);
CREATE INDEX IF NOT EXISTS idx_cards_match ON cards(match_id);
CREATE INDEX IF NOT EXISTS idx_cards_player ON cards(player_id);
CREATE INDEX IF NOT EXISTS idx_team_groups_team ON team_groups(team_id);
CREATE INDEX IF NOT EXISTS idx_team_groups_group ON team_groups(group_id);

-- Comentarios en las tablas
COMMENT ON TABLE teams IS 'Equipos participantes en la Copa Libertadores';
COMMENT ON TABLE players IS 'Jugadores registrados en cada equipo';
COMMENT ON TABLE copa_groups IS 'Grupos de la Copa Libertadores (A, B, C)';
COMMENT ON TABLE team_groups IS 'Posiciones de equipos en cada grupo';
COMMENT ON TABLE matches IS 'Partidos de la Copa Libertadores';
COMMENT ON TABLE goals IS 'Goles marcados en cada partido';
COMMENT ON TABLE cards IS 'Tarjetas amarillas y rojas';
COMMENT ON TABLE draws IS 'Sorteos de octavos de final';
