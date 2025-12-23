/*
  # Système de Gains et Commissions Créateurs

  1. Modifications à astra_profiles
    - `total_earnings` : Total des gains en étoiles
    - `total_commission_paid` : Total des commissions payées à la plateforme
    - `withdrawable_balance` : Solde retirable (converti en €)
    - `is_creator` : Statut créateur activé
    
  2. Modifications à stars_transactions
    - `commission_rate` : Taux de commission appliqué
    - `creator_gain` : Gain net du créateur
    - `platform_commission` : Commission de la plateforme
    
  3. Nouvelle table withdrawal_requests
    - Demandes de retrait des créateurs
    
  4. Security
    - RLS policies appropriées
*/

-- Ajouter colonnes earnings à astra_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'total_earnings'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN total_earnings integer DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'total_commission_paid'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN total_commission_paid integer DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'withdrawable_balance'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN withdrawable_balance decimal(10, 2) DEFAULT 0 NOT NULL;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'astra_profiles' AND column_name = 'is_creator'
  ) THEN
    ALTER TABLE astra_profiles ADD COLUMN is_creator boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Ajouter colonnes commission à stars_transactions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars_transactions' AND column_name = 'commission_rate'
  ) THEN
    ALTER TABLE stars_transactions ADD COLUMN commission_rate decimal(5, 4);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars_transactions' AND column_name = 'creator_gain'
  ) THEN
    ALTER TABLE stars_transactions ADD COLUMN creator_gain integer;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stars_transactions' AND column_name = 'platform_commission'
  ) THEN
    ALTER TABLE stars_transactions ADD COLUMN platform_commission integer;
  END IF;
END $$;

-- Créer table withdrawal_requests
CREATE TABLE IF NOT EXISTS withdrawal_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES astra_profiles(id) ON DELETE CASCADE,
  amount_stars integer NOT NULL,
  amount_euros decimal(10, 2) NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
  payment_method text,
  payment_details jsonb,
  requested_at timestamptz DEFAULT now() NOT NULL,
  processed_at timestamptz,
  processed_by uuid,
  notes text
);

CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_creator_id ON withdrawal_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_status ON withdrawal_requests(status);
CREATE INDEX IF NOT EXISTS idx_withdrawal_requests_requested_at ON withdrawal_requests(requested_at DESC);

-- Enable RLS
ALTER TABLE withdrawal_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Créateurs peuvent voir leurs propres demandes
CREATE POLICY "Creators can view own withdrawal requests"
  ON withdrawal_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_id);

-- Policy: Créateurs peuvent créer des demandes
CREATE POLICY "Creators can create withdrawal requests"
  ON withdrawal_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);
