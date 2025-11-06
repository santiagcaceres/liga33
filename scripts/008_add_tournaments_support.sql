-- Crear tabla de torneos
CREATE TABLE IF NOT EXISTS tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'copa_libertadores' o 'league'
  gender VARCHAR(20) NOT NULL, -- 'masculino' o 'femenino'
  season VARCHAR(50) NOT NULL, -- '2025', '2025-2026', etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Insertar los torneos iniciales
INSERT INTO tournaments (name, type, gender, season, active) VALUES
  ('Copa Libertadores 2025', 'copa_libertadores', 'masculino', '2025', true),
  ('SuperLiga Femenina 2025', 'league', 'femenino', '2025', true);

-- Agregar tournament_id a las tablas existentes
ALTER TABLE teams ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id);
ALTER TABLE matches ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id);
ALTER TABLE players ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id);
ALTER TABLE copa_groups ADD COLUMN IF NOT EXISTS tournament_id INTEGER REFERENCES tournaments(id);

-- Crear tabla de standings para ligas (todos contra todos)
CREATE TABLE IF NOT EXISTS league_standings (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  played INTEGER DEFAULT 0,
  won INTEGER DEFAULT 0,
  drawn INTEGER DEFAULT 0,
  lost INTEGER DEFAULT 0,
  goals_for INTEGER DEFAULT 0,
  goals_against INTEGER DEFAULT 0,
  goal_difference INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  UNIQUE(team_id, tournament_id)
);

-- Asignar el torneo de Copa Libertadores a los datos existentes
UPDATE teams SET tournament_id = 1 WHERE tournament_id IS NULL;
UPDATE matches SET tournament_id = 1 WHERE tournament_id IS NULL;
UPDATE players SET tournament_id = 1 WHERE tournament_id IS NULL;
UPDATE copa_groups SET tournament_id = 1 WHERE tournament_id IS NULL;

-- Habilitar RLS en las nuevas tablas
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE league_standings ENABLE ROW LEVEL SECURITY;

-- Crear políticas públicas para tournaments
CREATE POLICY "Allow public read access on tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on tournaments" ON tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on tournaments" ON tournaments FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on tournaments" ON tournaments FOR DELETE USING (true);

-- Crear políticas públicas para league_standings
CREATE POLICY "Allow public read access on league_standings" ON league_standings FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on league_standings" ON league_standings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on league_standings" ON league_standings FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on league_standings" ON league_standings FOR DELETE USING (true);
