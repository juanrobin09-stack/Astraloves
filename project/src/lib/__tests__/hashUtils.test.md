# Tests de la fonction normalizeHash

## Test 1: Hash avec double # (cas Supabase bugué)

**Input:**
```
#type=recovery#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires_at=1234567890&refresh_token=abc123def456
```

**Expected Output:**
```
#type=recovery&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires_at=1234567890&refresh_token=abc123def456
```

**Parsed Values:**
- type: "recovery"
- accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
- refreshToken: "abc123def456"
- expiresAt: "1234567890"

---

## Test 2: Hash correct avec un seul # (pas de modification nécessaire)

**Input:**
```
#type=recovery&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires_at=1234567890&refresh_token=abc123def456
```

**Expected Output:**
```
#type=recovery&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&expires_at=1234567890&refresh_token=abc123def456
```
(Inchangé)

**Parsed Values:**
- type: "recovery"
- accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
- refreshToken: "abc123def456"
- expiresAt: "1234567890"

---

## Test 3: Hash vide

**Input:**
```
""
```

**Expected Output:**
```
""
```

**Parsed Values:**
- type: ""
- accessToken: ""
- refreshToken: ""
- tokenHash: ""

---

## Test 4: Hash avec type=signup

**Input:**
```
#type=signup&access_token=token123&token_hash=hash456
```

**Expected Output:**
```
#type=signup&access_token=token123&token_hash=hash456
```
(Inchangé - pas de double #)

**Parsed Values:**
- type: "signup"
- accessToken: "token123"
- tokenHash: "hash456"

---

## Test 5: URL complète de Supabase avec double #

**Input:**
```
https://astraloves.com/#type=recovery#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1NjU4Nzk5LCJzdWIiOiJhYmMxMjMifQ.signature&expires_at=1735658799&expires_in=3600&refresh_token=refreshtoken123&token_type=bearer&type=recovery
```

**Hash extrait:**
```
#type=recovery#access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1NjU4Nzk5LCJzdWIiOiJhYmMxMjMifQ.signature&expires_at=1735658799&expires_in=3600&refresh_token=refreshtoken123&token_type=bearer&type=recovery
```

**Normalized:**
```
#type=recovery&access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1NjU4Nzk5LCJzdWIiOiJhYmMxMjMifQ.signature&expires_at=1735658799&expires_in=3600&refresh_token=refreshtoken123&token_type=bearer&type=recovery
```

**Parsed Values:**
- type: "recovery"
- accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM1NjU4Nzk5LCJzdWIiOiJhYmMxMjMifQ.signature"
- refreshToken: "refreshtoken123"
- expiresAt: "1735658799"
- expiresIn: "3600"
- tokenType: "bearer"

---

## Test 6: Hash avec plusieurs # (cas extrême)

**Input:**
```
#type=recovery#access_token=token#refresh_token=refresh
```

**Expected Output:**
```
#type=recovery&access_token=token&refresh_token=refresh
```

**Parsed Values:**
- type: "recovery"
- accessToken: "token"
- refreshToken: "refresh"

---

## Comment Tester Manuellement

1. Ouvre la console du navigateur (F12)

2. Copie-colle ce code:

```javascript
// Simuler le hash avec double #
window.location.hash = '#type=recovery#access_token=test123&refresh_token=refresh456';

// Vérifier le parsing
const rawHash = window.location.hash;
console.log('RAW HASH:', rawHash);

// Le hash devrait être parsé correctement par parseNormalizedHash
// Vérifie les logs dans la console
```

3. Vérifie les logs:
   - 🔧 RAW HASH BEFORE NORMALIZATION
   - ✅ NORMALIZED HASH (recovery fix)
   - 🔍 PARSED VALUES

4. Les valeurs devraient être:
   - type: "recovery"
   - accessToken: "test123"
   - refreshToken: "refresh456"
