-- Remove minute check constraints from goals and cards tables
-- This allows inserting goals and cards with minute = 0 when the exact minute is not specified

-- Remove the minute check constraint from goals table
ALTER TABLE goals DROP CONSTRAINT IF EXISTS goals_minute_check;

-- Remove the minute check constraint from cards table
ALTER TABLE cards DROP CONSTRAINT IF EXISTS cards_minute_check;

-- Verify the constraints have been removed
SELECT 
    conname AS constraint_name,
    conrelid::regclass AS table_name
FROM pg_constraint
WHERE conname IN ('goals_minute_check', 'cards_minute_check');
