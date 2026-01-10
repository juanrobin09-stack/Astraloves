/*
  # Fix age_max_check constraint

  1. Changes
    - Drop existing overly restrictive age_max_check constraint
    - Add new constraint allowing age_max between 18-120 years
  
  2. Security
    - No RLS changes needed
*/

-- Drop the overly restrictive constraint
ALTER TABLE public.astra_profiles DROP CONSTRAINT IF EXISTS astra_profiles_age_max_check;

-- Add new constraint with reasonable upper limit (18-120)
ALTER TABLE public.astra_profiles 
ADD CONSTRAINT astra_profiles_age_max_check 
CHECK (age_max >= 18 AND age_max <= 120);
