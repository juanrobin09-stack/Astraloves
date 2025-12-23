/*
  # Add banner_url column to astra_profiles

  1. Changes
    - Add `banner_url` column to `astra_profiles` table to store user's custom banner image
    - This banner will be displayed on dating cards instead of a default black banner
  
  2. Notes
    - Column is optional (nullable) since users may not have uploaded a banner yet
    - Uses TEXT type to store the URL of the banner image
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'banner_url'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN banner_url TEXT;
  END IF;
END $$;
