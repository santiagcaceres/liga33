-- Tabla para almacenar los cruces de las eliminatorias
CREATE TABLE IF NOT EXISTS playoffs (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER NOT NULL REFERENCES tournaments(id),
  phase VARCHAR(20) NOT NULL CHECK (phase IN ('octavos', 'cuartos', 'semifinal', 'final')),
  match_number INTEGER NOT NULL, -- 1-8 para octavos, 1-4 para cuartos, 1-2 para semis, 1 para final
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  played BOOLEAN DEFAULT FALSE,
  match_date DATE,
  match_time TIME,
  field VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, phase, match_number)
);

-- Habilitar RLS
ALTER TABLE playoffs ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público
CREATE POLICY "Allow public read access on playoffs" ON playoffs FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on playoffs" ON playoffs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on playoffs" ON playoffs FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on playoffs" ON playoffs FOR DELETE USING (true);
