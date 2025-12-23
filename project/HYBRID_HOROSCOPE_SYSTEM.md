# Système d'Horoscope Hybride

## Vue d'ensemble

Le système d'horoscope hybride combine des données astrologiques réelles avec une personnalisation par IA pour offrir trois niveaux d'expérience : Free, Premium et Elite.

## Architecture

### 1. Base de données (Supabase)

#### Table `horoscope_cache`
Stocke les données astrologiques du jour pour chaque signe :
- `zodiac_sign` : Le signe astrologique
- `date` : Date du jour
- `daily_data` : Horoscope quotidien (JSON)
- `planetary_positions` : Positions planétaires réelles (JSON)
- `transits` : Transits du jour (JSON)
- `weekly_forecast` : Prévisions hebdomadaires (JSON)
- `expires_at` : Expiration du cache (fin de journée)

**Cache Policy** : Les données sont mises en cache pour la journée entière pour éviter les appels API répétés.

#### Table `user_horoscope_messages`
Stocke les messages personnalisés par utilisateur :
- `user_id` : ID de l'utilisateur
- `zodiac_sign` : Signe de l'utilisateur
- `date` : Date du message
- `tier` : Niveau d'accès (free/premium/elite)
- `personalized_message` : Message généré par IA
- `birth_chart_analysis` : Analyse du thème astral (Elite uniquement)

### 2. Edge Function : `fetch-hybrid-horoscope`

**URL** : `/functions/v1/fetch-hybrid-horoscope`

**Processus** :
1. Vérifie le cache pour le signe et la date
2. Si pas de cache, récupère les données depuis l'API Aztro
3. Génère des positions planétaires et transits
4. Stocke dans le cache avec expiration en fin de journée
5. Génère un message personnalisé avec OpenAI si disponible
6. Retourne les données selon le tier de l'utilisateur

**Sources de données** :
- API Aztro : Horoscopes quotidiens gratuits
- Génération de positions planétaires
- Calcul de transits astrologiques
- OpenAI GPT-4 : Messages personnalisés

### 3. Service Client : `hybridHoroscopeService`

**Fichier** : `/src/lib/hybridHoroscope.ts`

**Fonctionnalités** :
- Cache local (1 heure) pour réduire les appels réseau
- Gestion automatique de l'authentification
- Fallback élégant en cas d'erreur
- Types TypeScript complets

### 4. Composant d'affichage : `HybridHoroscopeDisplay`

**Fichier** : `/src/components/HybridHoroscopeDisplay.tsx`

Affiche le contenu selon le tier :
- **Free** : Description tronquée, données basiques, CTA upgrade
- **Premium** : Contenu complet + transits + message personnalisé
- **Elite** : Tout Premium + positions planétaires + transits mineurs

## Niveaux d'accès

### 🆓 Free Tier
- Horoscope du jour (150 caractères)
- Humeur, couleur, chiffre porte-bonheur
- Message d'upgrade

### 💎 Premium Tier
- Horoscope complet (sans limite)
- Compatibilité avec autres signes
- Moment porte-bonheur
- Transits majeurs
- Message personnalisé par IA

### 👑 Elite Tier
- Tout le contenu Premium
- Positions planétaires réelles
- Transits mineurs détaillés
- Analyse hebdomadaire
- Thème astral complet
- Message ultra-personnalisé

## Personnalisation IA

Le système utilise OpenAI GPT-4-mini pour générer des messages personnalisés basés sur :
- Le signe astrologique de l'utilisateur
- L'horoscope du jour
- Les transits planétaires
- Le prénom de l'utilisateur
- L'humeur cosmique du jour

**Prompt type** :
```
Tu es un astrologue professionnel. Génère un message personnalisé pour [Prénom], [Signe].

Horoscope : [description]
Humeur : [mood]
Transits : [major transits]

Fournis des conseils pratiques et actionnables pour aujourd'hui.
Sois chaleureux, perspicace et encourageant. 2-3 phrases maximum.
```

## Cache et Performance

### Cache Base de données (Supabase)
- Durée : Jusqu'à minuit du jour actuel
- Partagé entre tous les utilisateurs du même signe
- Nettoyage automatique des caches expirés > 7 jours

### Cache Client
- Durée : 1 heure
- Spécifique à chaque combinaison utilisateur/tier/signe
- Stocké en mémoire (Map JavaScript)

## Fallback Strategy

Si l'API externe échoue :
1. Génération d'horoscope générique par signe
2. Données simulées mais cohérentes
3. Aucune erreur visible pour l'utilisateur
4. Retry automatique au prochain chargement

## Sources de données astrologiques

### API Aztro (Principale)
- **URL** : `https://aztro.sameerkumar.website`
- **Gratuite** : Oui
- **Données** : Horoscope quotidien, compatibilité, humeur, couleurs

### Génération algorithmique
- Positions planétaires simulées mais crédibles
- Transits calculés de manière cohérente
- Recommandations basées sur le signe

## Intégration dans l'application

### Page Astro
**Fichier** : `/src/components/AstroPage.tsx`

**Flux** :
1. Récupération du profil utilisateur
2. Détermination du signe (depuis birth_date ou zodiac_sign)
3. Détermination du tier (free/premium/elite)
4. Appel au service hybride
5. Affichage avec le composant adapté

### État de chargement
- Spinner centré avec animation
- Message "Consultation des astres..."
- Navigation bottom bar visible même pendant le chargement

## Configuration requise

### Variables d'environnement
```env
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_cle_anon
OPENAI_API_KEY=votre_cle_openai (optionnel)
```

**Note** : Si `OPENAI_API_KEY` n'est pas configurée, le système utilise des messages fallback de qualité.

## Sécurité

### RLS (Row Level Security)
- `horoscope_cache` : Lecture publique (données non sensibles)
- `user_horoscope_messages` : Lecture uniquement par propriétaire

### Authentication
- Tous les appels requièrent un token JWT valide
- Validation côté serveur dans l'edge function
- Les données personnelles ne sont jamais exposées

## Évolutions futures

### Court terme
- Intégration de vraies positions planétaires (API NASA)
- Calcul de thème astral complet pour Elite
- Prévisions hebdomadaires détaillées

### Moyen terme
- Notifications push pour événements astrologiques importants
- Historique des horoscopes passés
- Comparaison de compatibilité entre utilisateurs

### Long terme
- Calcul de synastrie (compatibilité entre deux thèmes)
- Transits personnalisés selon l'heure de naissance
- Prédictions annuelles

## Maintenance

### Nettoyage automatique
Une fonction PostgreSQL nettoie les caches expirés :
```sql
SELECT clean_expired_horoscope_cache();
```

**Recommandation** : Configurer un cron job quotidien via Supabase.

### Monitoring
Points à surveiller :
- Taux de succès des appels à l'API Aztro
- Temps de réponse de l'edge function
- Utilisation du cache (hit rate)
- Coût OpenAI (nombre de tokens)

## Support

Pour tout problème :
1. Vérifier les logs de l'edge function
2. Vérifier la table `horoscope_cache` pour les données du jour
3. Tester l'API Aztro directement
4. Vérifier la configuration OpenAI

## Résumé des fichiers

```
/supabase/migrations/
  └── create_horoscope_cache_system.sql

/supabase/functions/
  └── fetch-hybrid-horoscope/
      └── index.ts

/src/lib/
  └── hybridHoroscope.ts

/src/components/
  ├── HybridHoroscopeDisplay.tsx
  └── AstroPage.tsx
```
