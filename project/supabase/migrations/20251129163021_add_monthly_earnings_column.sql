/*
  # Add monthly_earnings column to astra_profiles

  1. Changes
    - Add `monthly_earnings` column to track monthly creator earnings
    - Default value: 0
    - Type: integer (stars earned this month)

  2. Notes
    - Used for creator earnings display
    - Reset monthly by cron job or edge function
*/

-- Add monthly_earnings column
ALTER TABLE astra_profiles 
ADD COLUMN IF NOT EXISTS monthly_earnings INTEGER DEFAULT 0;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_astra_profiles_monthly_earnings 
ON astra_profiles(monthly_earnings) 
WHERE is_creator = true;
