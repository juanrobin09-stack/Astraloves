/*
  # Create Subscription Tiers Table

  1. New Tables
    - `subscription_tiers`
      - `id` (uuid, primary key)
      - `name` (text) - Tier name (Free, Premium)
      - `price_monthly` (integer) - Price in cents
      - `stripe_price_id` (text) - Stripe Price ID
      - `daily_message_limit` (integer) - Daily message limit
      - `features` (jsonb) - Additional features
      - `is_active` (boolean) - Whether tier is available
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `subscription_tiers` table
    - Add policy for all authenticated users to read tiers
    
  3. Initial Data
    - Free tier: 3 messages/day
    - Premium tier: unlimited messages
*/

CREATE TABLE IF NOT EXISTS subscription_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_monthly integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  daily_message_limit integer NOT NULL DEFAULT 3,
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscription_tiers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription tiers"
  ON subscription_tiers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Insert default tiers
INSERT INTO subscription_tiers (name, price_monthly, daily_message_limit, features, stripe_price_id)
VALUES 
  ('Free', 0, 3, '["3 messages par jour", "Accès au chat de base"]'::jsonb, NULL),
  ('Premium', 999, 999999, '["Messages illimités", "Accès prioritaire", "Analyses avancées"]'::jsonb, 'price_premium_monthly')
ON CONFLICT (name) DO NOTHING;