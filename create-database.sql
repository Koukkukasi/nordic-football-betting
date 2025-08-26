-- Nordic Football Betting Database Setup Script
-- Run this script in pgAdmin or psql

-- Check if database exists and create if not
SELECT 'Checking for existing database...' as status;

-- Drop database if you want to start fresh (uncomment next line)
-- DROP DATABASE IF EXISTS nordic_football_betting;

-- Create the database
CREATE DATABASE nordic_football_betting
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'Finnish_Finland.1252'
    LC_CTYPE = 'Finnish_Finland.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- Grant all privileges
GRANT ALL ON DATABASE nordic_football_betting TO postgres;

-- Success message
SELECT 'Database nordic_football_betting created successfully!' as status;

-- Connect to the new database
\c nordic_football_betting;

-- Create extension for UUID support (optional but recommended)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT 'Setup complete! You can now run Prisma migrations.' as status;