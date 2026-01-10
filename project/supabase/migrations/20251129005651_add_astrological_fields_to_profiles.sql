/*
  # Add Astrological Fields to Profiles

  ## Overview
  Adds astrological and matching-related fields to astra_profiles table for the matching system.

  ## New Columns Added
  
  ### Astrological Data
  - `pseudo` (text, unique) - Public username for matching system
  - `birth_date` (date) - Date of birth for astrological calculations
  - `birth_time` (time) - Time of birth for ascendant/houses
  - `birth_place` (text) - Place of birth (city, country)
  - `signe_solaire` (text) - Sun sign (Bélier, Taureau, etc.)
  - `ascendant` (text) - Rising sign
  - `lune` (text) - Moon sign
  
  ### Matching Preferences
  - `looking_for` (text) - Type of relationship (amitié, relation sérieuse, etc.)
  - `valeurs` (jsonb) - Array of values (famille, aventure, etc.)
  - `interets` (jsonb) - Array of interests
  - `distance_max` (integer) - Maximum distance in km (default 50)
  - `age_min` (integer) - Minimum age preference (default 18)
  - `age_max` (integer) - Maximum age preference (default 60)
  - `signes_compatibles` (jsonb) - Preferred compatible signs
  
  ### Profile Details
  - `photos` (jsonb) - Array of photo URLs
  - `bio` (text) - Short bio/description
  - `ville` (text) - Current city
  - `visible_in_matching` (boolean) - Show in discovery feed (default true)
  
  ## Security
  - No changes to existing RLS policies
  - All new fields respect existing security model
*/

-- Add pseudo column with uniqueness
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'pseudo'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN pseudo text;
  END IF;
END $$;

-- Add unique constraint on pseudo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'astra_profiles_pseudo_key'
  ) THEN
    ALTER TABLE astra_profiles ADD CONSTRAINT astra_profiles_pseudo_key UNIQUE (pseudo);
  END IF;
END $$;

-- Add astrological fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'birth_date'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN birth_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'birth_time'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN birth_time time;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'birth_place'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN birth_place text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'signe_solaire'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN signe_solaire text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'ascendant'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN ascendant text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'lune'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN lune text;
  END IF;
END $$;

-- Add matching preference fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'looking_for'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN looking_for text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'valeurs'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN valeurs jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'interets'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN interets jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'distance_max'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN distance_max integer DEFAULT 50;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'signes_compatibles'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN signes_compatibles jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Add profile detail fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'photos'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN photos jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'bio'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN bio text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'ville'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN ville text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'visible_in_matching'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN visible_in_matching boolean DEFAULT true;
  END IF;
END $$;