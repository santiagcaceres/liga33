-- Add match_time and field columns to matches table
ALTER TABLE matches 
ADD COLUMN IF NOT EXISTS match_time TIME,
ADD COLUMN IF NOT EXISTS field VARCHAR(100);

-- Add comment to columns
COMMENT ON COLUMN matches.match_time IS 'Hora del partido';
COMMENT ON COLUMN matches.field IS 'Cancha donde se juega el partido';
