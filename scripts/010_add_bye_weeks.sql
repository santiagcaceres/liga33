-- Add bye weeks table for league format
CREATE TABLE IF NOT EXISTS bye_weeks (
  id SERIAL PRIMARY KEY,
  tournament_id INTEGER REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, team_id, round)
);

-- Enable RLS
ALTER TABLE bye_weeks ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access on bye_weeks" ON bye_weeks FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on bye_weeks" ON bye_weeks FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on bye_weeks" ON bye_weeks FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on bye_weeks" ON bye_weeks FOR DELETE USING (true);
