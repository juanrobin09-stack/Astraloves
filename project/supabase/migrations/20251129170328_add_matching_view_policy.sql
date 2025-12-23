/*
  # Ajouter policy pour voir les profils dans le matching

  1. Problème
    - Actuellement, les utilisateurs ne peuvent voir QUE leur propre profil
    - Impossible de voir les autres profils pour swiper

  2. Solution
    - Ajouter une policy SELECT pour voir les profils visibles dans le matching
    - Les utilisateurs authentifiés peuvent voir les profils où:
      * visible_in_matching = true
      * onboarding_completed = true
      * Ce n'est pas leur propre profil

  3. Sécurité
    - Accès restreint aux utilisateurs authentifiés
    - Seuls les profils qui ont choisi d'être visibles sont affichés
    - Respect de la vie privée
*/

-- Créer la policy pour voir les profils dans le matching
CREATE POLICY "Users can view profiles for matching"
  ON astra_profiles
  FOR SELECT
  TO authenticated
  USING (
    visible_in_matching = true 
    AND onboarding_completed = true
    AND id != auth.uid()
  );
