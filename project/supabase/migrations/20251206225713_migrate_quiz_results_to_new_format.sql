/*
  # Migration des anciennes données quiz_results vers le nouveau format

  1. Objectif
    - Convertir toutes les données au format attendu par MyResultsPage
    - Extraire description, strengths, weaknesses et traits
    - Gérer différents formats d'anciennes données
  
  2. Format cible
    - description: string (analyse générale)
    - strengths: string[] (forces)
    - weaknesses: string[] (faiblesses)
    - traits: string[] (traits caractéristiques)
*/

-- Fonction pour extraire une description depuis l'ancien format
CREATE OR REPLACE FUNCTION extract_description(data jsonb)
RETURNS text AS $$
BEGIN
  -- Essayer différents chemins possibles
  IF data ? 'description' AND (data->>'description') IS NOT NULL AND length(data->>'description') > 0 THEN
    RETURN data->>'description';
  ELSIF data ? 'analysis' AND (data->'analysis'->>'interaction_style') IS NOT NULL THEN
    RETURN data->'analysis'->>'interaction_style';
  ELSIF data ? 'mainResult' THEN
    RETURN data->>'mainResult';
  ELSE
    RETURN 'Analyse de votre profil complétée avec succès.';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour extraire les forces depuis l'ancien format
CREATE OR REPLACE FUNCTION extract_strengths(data jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  trait jsonb;
BEGIN
  -- Si strengths existe et n'est pas vide
  IF data ? 'strengths' AND jsonb_array_length(data->'strengths') > 0 THEN
    RETURN data->'strengths';
  END IF;
  
  -- Extraire depuis analysis.personality_traits
  IF data ? 'analysis' AND data->'analysis' ? 'personality_traits' THEN
    FOR trait IN SELECT * FROM jsonb_array_elements(data->'analysis'->'personality_traits')
    LOOP
      result := result || to_jsonb(trait->>'trait');
    END LOOP;
    RETURN result;
  END IF;
  
  RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour extraire les faiblesses/défis
CREATE OR REPLACE FUNCTION extract_weaknesses(data jsonb)
RETURNS jsonb AS $$
BEGIN
  IF data ? 'weaknesses' AND jsonb_array_length(data->'weaknesses') > 0 THEN
    RETURN data->'weaknesses';
  ELSIF data ? 'attention' AND jsonb_array_length(data->'attention') > 0 THEN
    RETURN data->'attention';
  END IF;
  
  RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour extraire les traits
CREATE OR REPLACE FUNCTION extract_traits(data jsonb)
RETURNS jsonb AS $$
DECLARE
  result jsonb := '[]'::jsonb;
  trait jsonb;
BEGIN
  IF data ? 'traits' AND jsonb_array_length(data->'traits') > 0 THEN
    RETURN data->'traits';
  END IF;
  
  -- Extraire le nom des traits depuis personality_traits
  IF data ? 'analysis' AND data->'analysis' ? 'personality_traits' THEN
    FOR trait IN SELECT * FROM jsonb_array_elements(data->'analysis'->'personality_traits')
    LOOP
      result := result || to_jsonb(trait->>'trait');
    END LOOP;
    IF jsonb_array_length(result) > 3 THEN
      RETURN jsonb_build_array(
        result->0,
        result->1,
        result->2
      );
    END IF;
    RETURN result;
  END IF;
  
  RETURN '[]'::jsonb;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour toutes les données
UPDATE quiz_results
SET result_data = jsonb_build_object(
  'description', extract_description(result_data),
  'strengths', extract_strengths(result_data),
  'weaknesses', extract_weaknesses(result_data),
  'traits', extract_traits(result_data),
  'mainResult', COALESCE(result_data->>'mainResult', result_data->>'title', 'Résultat'),
  'percentage', COALESCE((result_data->>'percentage')::int, 75)
)
WHERE result_data IS NOT NULL;

-- Nettoyer les fonctions temporaires
DROP FUNCTION IF EXISTS extract_description(jsonb);
DROP FUNCTION IF EXISTS extract_strengths(jsonb);
DROP FUNCTION IF EXISTS extract_weaknesses(jsonb);
DROP FUNCTION IF EXISTS extract_traits(jsonb);
DROP FUNCTION IF EXISTS clean_bullet_array(jsonb);
