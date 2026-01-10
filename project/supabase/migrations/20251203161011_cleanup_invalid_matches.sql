/*
  # Nettoyage des matchs invalides

  1. Problème identifié
    - Des matchs étaient créés à chaque like sans vérifier la mutualité
    - Les matchs doivent seulement exister si les deux utilisateurs se sont likés

  2. Solution
    - Supprimer tous les matchs où user1_liked et user2_liked ne sont pas tous les deux à true
    - Garder seulement les vrais matchs mutuels

  3. Impact
    - Nettoyage de la base de données
    - Les utilisateurs ne verront plus de faux matchs
*/

-- Supprimer les matchs qui ne sont pas mutuels
DELETE FROM matches 
WHERE NOT (user1_liked = true AND user2_liked = true);

-- S'assurer que tous les matchs restants ont le statut 'mutual'
UPDATE matches 
SET statut = 'mutual' 
WHERE user1_liked = true AND user2_liked = true AND statut != 'mutual';
