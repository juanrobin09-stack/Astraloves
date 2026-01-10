/*
 * Utilitaire pour normaliser les hash URLs malformés
 *
 * PROBLÈME:
 * Supabase envoie parfois des liens de reset avec DEUX caractères "#" :
 * https://astraloves.com/#type=recovery#access_token=...&refresh_token=...
 *                                       ^           ^
 *                                  premier #   deuxième # (devrait être &)
 *
 * Cela casse le parsing URLSearchParams car il considère tout après le premier # comme la clé.
 * Exemple: type = "recovery#access_token=..." au lieu de "recovery"
 *
 * SOLUTION:
 * On remplace le deuxième # par & pour normaliser le format avant parsing.
 */

export function normalizeHash(rawHash: string): string {
  let normalized = rawHash;

  // Cas spécifique: #type=recovery#access_token=...
  // On remplace le # après "recovery" par &
  if (normalized.includes('#type=recovery#')) {
    normalized = normalized.replace('#type=recovery#', '#type=recovery&');
  }

  // Cas général: si on détecte plusieurs # dans le hash
  // On garde le premier et on remplace les suivants par &
  const firstHashIndex = normalized.indexOf('#');
  if (firstHashIndex !== -1) {
    const afterFirstHash = normalized.substring(firstHashIndex + 1);
    if (afterFirstHash.includes('#')) {
      const parts = normalized.split('#');
      normalized = '#' + parts.slice(1).join('&');
    }
  }

  return normalized;
}

export function parseNormalizedHash(rawHash: string): {
  type: string;
  accessToken: string;
  refreshToken: string;
  tokenHash: string;
  expiresAt: string;
  expiresIn: string;
  tokenType: string;
} {
  // Étape 1: Normaliser le hash (corriger le double #)
  const normalizedHash = normalizeHash(rawHash);

  // Étape 2: Retirer le # initial pour URLSearchParams
  const search = normalizedHash.startsWith('#')
    ? normalizedHash.slice(1)
    : normalizedHash;

  // Étape 3: Parser avec URLSearchParams
  const params = new URLSearchParams(search);

  // Étape 4: Extraire les valeurs
  const type = params.get('type') || '';
  const accessToken = params.get('access_token') || '';
  const refreshToken = params.get('refresh_token') || '';
  const tokenHash = params.get('token_hash') || '';
  const expiresAt = params.get('expires_at') || '';
  const expiresIn = params.get('expires_in') || '';
  const tokenType = params.get('token_type') || '';

  return {
    type,
    accessToken,
    refreshToken,
    tokenHash,
    expiresAt,
    expiresIn,
    tokenType
  };
}
