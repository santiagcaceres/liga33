-- Habilitar RLS en todas las tablas
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE copa_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;

-- Crear políticas públicas para todas las tablas (sin autenticación de usuarios)
-- Esto permite que cualquiera pueda leer y escribir en las tablas

-- Teams
CREATE POLICY "Allow public read access on teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on teams" ON teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on teams" ON teams FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on teams" ON teams FOR DELETE USING (true);

-- Players
CREATE POLICY "Allow public read access on players" ON players FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on players" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on players" ON players FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on players" ON players FOR DELETE USING (true);

-- Copa Groups
CREATE POLICY "Allow public read access on copa_groups" ON copa_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on copa_groups" ON copa_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on copa_groups" ON copa_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on copa_groups" ON copa_groups FOR DELETE USING (true);

-- Team Groups
CREATE POLICY "Allow public read access on team_groups" ON team_groups FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on team_groups" ON team_groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on team_groups" ON team_groups FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on team_groups" ON team_groups FOR DELETE USING (true);

-- Matches
CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on matches" ON matches FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on matches" ON matches FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on matches" ON matches FOR DELETE USING (true);

-- Goals
CREATE POLICY "Allow public read access on goals" ON goals FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on goals" ON goals FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on goals" ON goals FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on goals" ON goals FOR DELETE USING (true);

-- Cards
CREATE POLICY "Allow public read access on cards" ON cards FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on cards" ON cards FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on cards" ON cards FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on cards" ON cards FOR DELETE USING (true);

-- Draws
CREATE POLICY "Allow public read access on draws" ON draws FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on draws" ON draws FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on draws" ON draws FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on draws" ON draws FOR DELETE USING (true);

-- News
CREATE POLICY "Allow public read access on news" ON news FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on news" ON news FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on news" ON news FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on news" ON news FOR DELETE USING (true);
