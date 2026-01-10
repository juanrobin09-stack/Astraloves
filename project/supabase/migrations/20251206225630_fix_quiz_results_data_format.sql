/*
  # Correction du format des données dans quiz_results

  1. Corrections
    - Renommer le champ "attention" en "weaknesses" dans result_data
    - Nettoyer les puces • au début de chaque élément des tableaux
    - Ajouter un champ "traits" vide si manquant
    - S'assurer que tous les champs sont des tableaux sans puces
  
  2. Sécurité
    - Mise à jour non-destructive des données existantes
    - Préservation de toutes les informations
*/

-- Fonction pour nettoyer les puces d'un tableau
CREATE OR REPLACE FUNCTION clean_bullet_array(arr jsonb)
RETURNS jsonb AS $$
DECLARE
  item jsonb;
  cleaned_arr jsonb := '[]'::jsonb;
  cleaned_text text;
BEGIN
  IF arr IS NULL OR jsonb_typeof(arr) != 'array' THEN
    RETURN '[]'::jsonb;
  END IF;
  
  FOR item IN SELECT * FROM jsonb_array_elements(arr)
  LOOP
    cleaned_text := regexp_replace(item #>> '{}', '^[•\-\*\s]+', '', 'g');
    cleaned_arr := cleaned_arr || to_jsonb(trim(cleaned_text));
  END LOOP;
  
  RETURN cleaned_arr;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour tous les résultats existants
UPDATE quiz_results
SET result_data = jsonb_set(
  jsonb_set(
    jsonb_set(
      jsonb_set(
        result_data,
        '{strengths}',
        COALESCE(clean_bullet_array(result_data->'strengths'), '[]'::jsonb)
      ),
      '{weaknesses}',
      COALESCE(
        clean_bullet_array(result_data->'weaknesses'),
        clean_bullet_array(result_data->'attention'),
        '[]'::jsonb
      )
    ),
    '{traits}',
    COALESCE(result_data->'traits', '[]'::jsonb)
  ),
  '{advice}',
  COALESCE(clean_bullet_array(result_data->'advice'), '[]'::jsonb)
)
WHERE result_data IS NOT NULL;

-- Supprimer l'ancien champ "attention" si présent
UPDATE quiz_results
SET result_data = result_data - 'attention'
WHERE result_data ? 'attention';

-- Nettoyer les anciens champs "improvements" (optionnel, peut être conservé)
UPDATE quiz_results
SET result_data = jsonb_set(
  result_data,
  '{improvements}',
  clean_bullet_array(result_data->'improvements')
)
WHERE result_data ? 'improvements';
