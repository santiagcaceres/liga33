-- Add logo_url column to teams table
ALTER TABLE teams ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add comment to the column
COMMENT ON COLUMN teams.logo_url IS 'URL of the team logo image (JPG format)';
