/*
  # Create Stripe webhook logs table

  1. New Tables
    - `stripe_webhook_logs`
      - `id` (uuid, primary key)
      - `event_id` (text) - Stripe event ID
      - `event_type` (text) - Type of event (checkout.session.completed, etc.)
      - `payload` (jsonb) - Full webhook payload
      - `processing_result` (text) - Success or error message
      - `user_id` (uuid) - User affected by this webhook
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `stripe_webhook_logs` table
    - Only service role can insert logs
    - No public access

  3. Purpose
    - Debug webhook issues
    - Track all Stripe events
    - Identify why premium activation fails
*/

CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id text NOT NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL,
  processing_result text,
  user_id uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stripe_webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No public access to webhook logs"
  ON stripe_webhook_logs
  FOR ALL
  TO authenticated
  USING (false);
