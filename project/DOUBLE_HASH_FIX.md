# Fix du Double Hash (#) dans les Liens de Réinitialisation Supabase

## 🚨 Problème

Supabase envoie parfois des liens de réinitialisation de mot de passe avec **DEUX caractères `#`** au lieu d'un seul :

```
❌ URL MALFORMÉE (reçue de Supabase):
https://astraloves.com/#type=recovery#access_token=eyJhbG...&expires_at=...&refresh_token=...

✅ URL ATTENDUE:
https://astraloves.com/#type=recovery&access_token=eyJhbG...&expires_at=...&refresh_token=...
                                     ^           ^
                                premier #   DEVRAIT être &
```

### Impact du Bug

Quand on parse l'URL avec `URLSearchParams`, le deuxième `#` casse le parsing :

```typescript
// AVANT LE FIX:
const hashParams = new URLSearchParams(window.location.hash.substring(1));
const type = hashParams.get('type');
// Résultat: type = "recovery#access_token=eyJhbG..."  ❌ INCORRECT

const accessToken = hashParams.get('access_token');
// Résultat: accessToken = null  ❌ INCORRECT
```

## ✅ Solution Implémentée

### 1. Nouvelle Fonction Utilitaire: `hashUtils.ts`

Créé un nouveau fichier `/src/lib/hashUtils.ts` avec deux fonctions :

#### `normalizeHash(rawHash: string): string`

Corrige automatiquement le double `#` en remplaçant le deuxième par `&` :

```typescript
// Exemple:
normalizeHash('#type=recovery#access_token=...&refresh_token=...')
// Retourne: '#type=recovery&access_token=...&refresh_token=...'
```

#### `parseNormalizedHash(rawHash: string): object`

Parse le hash après normalisation et retourne un objet avec tous les paramètres :

```typescript
const parsed = parseNormalizedHash(window.location.hash);
// Retourne:
{
  type: 'recovery',
  accessToken: 'eyJhbG...',
  refreshToken: 'eyJhbG...',
  tokenHash: '',
  expiresAt: '1234567890',
  expiresIn: '3600',
  tokenType: 'bearer'
}
```

### 2. Intégration dans les Fichiers Existants

#### `App.tsx`

```typescript
import { parseNormalizedHash } from './lib/hashUtils';

// Dans useEffect:
const rawHash = window.location.hash;
const parsed = parseNormalizedHash(rawHash);

const type = parsed.type || queryParams.get('type') || '';
const accessToken = parsed.accessToken || queryParams.get('access_token') || '';
const refreshToken = parsed.refreshToken || queryParams.get('refresh_token') || '';
```

#### `AuthContext.tsx`

```typescript
import { parseNormalizedHash } from '../lib/hashUtils';

// Dans useEffect:
const rawHash = window.location.hash;
const parsed = parseNormalizedHash(rawHash);

const type = parsed.type || queryParams.get('type') || '';
const accessToken = parsed.accessToken || queryParams.get('access_token') || '';
const refreshToken = parsed.refreshToken || queryParams.get('refresh_token') || '';
```

#### `ResetPasswordPage.tsx`

```typescript
import { parseNormalizedHash } from '../lib/hashUtils';

// Dans checkSession:
const rawHash = window.location.hash;
const parsed = parseNormalizedHash(rawHash);

const type = parsed.type || queryParams.get('type') || '';
const accessToken = parsed.accessToken || queryParams.get('access_token') || '';
const refreshToken = parsed.refreshToken || queryParams.get('refresh_token') || '';
```

### 3. Logs de Debug

La solution ajoute des logs clairs pour tracer le problème :

```typescript
🔧 RAW HASH BEFORE NORMALIZATION: #type=recovery#access_token=...
✅ NORMALIZED HASH (recovery fix): #type=recovery&access_token=...
🔍 PARSED VALUES: {
  type: 'recovery',
  hasAccessToken: true,
  accessTokenLength: 512,
  hasRefreshToken: true,
  refreshTokenLength: 256,
  ...
}
```

## 🧪 Test de la Solution

### Checklist de Test Complète

1. **Demander un reset de mot de passe**
   - Va sur https://astraloves.com
   - Clique "Mot de passe oublié"
   - Entre ton email
   - Vérifie que tu reçois l'email

2. **Cliquer sur le lien (avec ou sans double #)**
   - Ouvre l'email de reset
   - Clique sur le lien
   - Ouvre la console du navigateur (F12)
   - Vérifie les logs :
     ```
     🔧 RAW HASH BEFORE NORMALIZATION
     ✅ NORMALIZED HASH (si nécessaire)
     🔍 PARSED VALUES
     🔐 RECOVERY DETECTED in App.tsx
     ```

3. **Changer le mot de passe**
   - Entre un nouveau mot de passe (min 8 caractères)
   - Confirme le mot de passe
   - Clique "Changer mon mot de passe"
   - Vérifie : `✅ Password updated successfully`
   - Vérifie la redirection vers la page swipe

4. **Vérifier la connexion**
   - Vérifie que tu es connecté
   - Déconnecte-toi
   - Reconnecte-toi avec le nouveau mot de passe

### Logs à Surveiller

```
✅ Logs Attendus (ordre chronologique):
├─ 🔧 RAW HASH BEFORE NORMALIZATION
├─ ✅ NORMALIZED HASH (recovery fix)
├─ 🔍 PARSED VALUES
├─ 🔐 RECOVERY DETECTED in App.tsx
├─ 🔐 Tokens extracted from URL hash
├─ 🔐 ResetPasswordPage - Session check start
├─ ✅ Session exchanged successfully
└─ ✅ Password updated successfully
```

## 📁 Fichiers Modifiés

1. **NOUVEAU:** `src/lib/hashUtils.ts`
   - Fonction `normalizeHash()`
   - Fonction `parseNormalizedHash()`

2. **MODIFIÉ:** `src/App.tsx`
   - Import de `parseNormalizedHash`
   - Utilisation dans le premier `useEffect`
   - Utilisation dans `handleAuthCallback`
   - Checklist mise à jour avec explication du double #

3. **MODIFIÉ:** `src/contexts/AuthContext.tsx`
   - Import de `parseNormalizedHash`
   - Utilisation dans le `useEffect` d'initialisation

4. **MODIFIÉ:** `src/components/ResetPasswordPage.tsx`
   - Import de `parseNormalizedHash`
   - Utilisation dans `checkSession`

## 🔒 Robustesse de la Solution

### Gestion des Cas Limites

1. **Hash avec un seul #** (format correct)
   ```
   #type=recovery&access_token=...
   → Pas de modification, parsing direct
   ```

2. **Hash avec deux #** (format Supabase bugué)
   ```
   #type=recovery#access_token=...
   → Corrigé en: #type=recovery&access_token=...
   ```

3. **Hash avec plusieurs #** (cas extrême)
   ```
   #type=recovery#access_token=...#refresh_token=...
   → Corrigé en: #type=recovery&access_token=...&refresh_token=...
   ```

4. **Fallback sur query params**
   ```typescript
   const type = parsed.type || queryParams.get('type') || '';
   ```
   Si le hash est vide, on cherche dans les query params

### Compatibilité

- ✅ Ne casse pas les autres types de liens (`type=signup`, `type=magiclink`, etc.)
- ✅ Compatible avec les liens sans hash (routes normales)
- ✅ Pas d'effet de bord sur la navigation existante
- ✅ Fonctionne avec ou sans le bug du double #

## 🚀 Déploiement

Le build fonctionne correctement :

```bash
npm run build
✓ 1599 modules transformed.
✓ built in 7.19s
```

La solution est prête pour la production et corrige le problème sans impacter le reste de l'application.

## 📝 Notes Importantes

- **Pas besoin de modifier Supabase** : Le fix est côté frontend uniquement
- **Rétrocompatible** : Fonctionne avec les anciens ET nouveaux liens
- **Maintenable** : Code isolé dans `hashUtils.ts`, facile à modifier
- **Debuggable** : Logs clairs à chaque étape du processus
