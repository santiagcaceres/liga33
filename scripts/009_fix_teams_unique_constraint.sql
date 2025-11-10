-- Drop the existing unique constraint on team name only
ALTER TABLE teams DROP CONSTRAINT IF EXISTS teams_name_key;

-- Add a new composite unique constraint on (name, tournament_id)
-- This allows the same team name to exist in different tournaments
ALTER TABLE teams ADD CONSTRAINT teams_name_tournament_unique UNIQUE (name, tournament_id);

-- Also do the same for players if needed (cedula should be unique per tournament)
ALTER TABLE players DROP CONSTRAINT IF EXISTS players_cedula_key;
ALTER TABLE players ADD CONSTRAINT players_cedula_tournament_unique UNIQUE (cedula, tournament_id);

-- Add comments to document the constraints
COMMENT ON CONSTRAINT teams_name_tournament_unique ON teams IS 
'Ensures team names are unique within each tournament, allowing same names across different tournaments';

COMMENT ON CONSTRAINT players_cedula_tournament_unique ON players IS 
'Ensures player cedulas are unique within each tournament, allowing same players to exist in different tournaments';
