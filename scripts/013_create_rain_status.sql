-- Create rain status table
CREATE TABLE IF NOT EXISTS rain_status (
  id INTEGER PRIMARY KEY DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE rain_status ENABLE ROW LEVEL SECURITY;

-- Allow public to read
CREATE POLICY "Allow public read access on rain_status"
ON rain_status FOR SELECT
TO public
USING (true);

-- Allow public to update (admin will use this)
CREATE POLICY "Allow public update access on rain_status"
ON rain_status FOR UPDATE
TO public
USING (true);

-- Allow public to insert (to create initial record)
CREATE POLICY "Allow public insert access on rain_status"
ON rain_status FOR INSERT
TO public
WITH CHECK (true);

-- Insert initial record
INSERT INTO rain_status (id, active) VALUES (1, false)
ON CONFLICT (id) DO NOTHING;
