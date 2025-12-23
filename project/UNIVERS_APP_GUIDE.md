# Application Univers - Guide Complet

## Accès à l'application

L'application est accessible à l'URL : `https://votredomaine.com/universe-app` ou `https://votredomaine.com/#universe-app`

## Structure de l'application

### 📱 Interface principale

L'application est composée de trois parties :

1. **Header fixe** (en haut)
   - Titre "Univers" avec sous-titre
   - Compteurs en temps réel :
     - 💫 Signaux restants
     - 🌟 Super Nova (si Premium/Elite)
     - ⚡ Messages IA
     - 💬 Messages matchs
   - Badge doré avec le nombre de signaux reçus (14)

2. **Zone Univers** (centre)
   - Fond noir avec 60 étoiles scintillantes en arrière-plan
   - Profils affichés sous forme d'étoiles circulaires
   - Couleurs des bordures selon la compatibilité :
     - Rouge vif : 90-100%
     - Rouge foncé : 70-89%
     - Gris : <70%
   - Particules dorées flottantes pour les utilisateurs Elite

3. **Footer navigation** (en bas)
   - 5 onglets : Univers (actif en rouge), Messages, Astra, Astro, Profil

### 🎯 Système d'abonnement

#### Plan GRATUIT (0€/mois)
- ✅ 15 étoiles visibles et nettes
- ⚠️ 5 étoiles floutées (16-20) avec cadenas 🔒
- 10 signaux par jour
- ❌ Pas de Super Nova (bouton grisé)
- 10 messages IA par jour
- 20 messages matchs
- Clic sur étoile floutée → Modal upgrade

#### Plan PREMIUM 💎 (9,99€/mois)
- ✅ 50 étoiles nettes
- ⚠️ 10 étoiles semi-transparentes (51-60) avec couronne 👑
- ∞ signaux illimités
- 1 Super Nova par jour
- 40 messages IA par jour
- ∞ messages matchs
- Badge bleu 💎
- Voir qui t'a signalé

#### Plan ELITE 👑 (14,99€/mois)
- ✅ Toutes les étoiles débloquées (illimité)
- ∞ signaux illimités
- 5 Super Nova par jour
- 65 messages IA Ultra par jour
- ∞ messages matchs
- Badge doré 👑 avec animation shimmer
- Aura dorée rotative autour de ton étoile
- Particules dorées flottantes dans l'univers
- Mode incognito 🎭
- Filtres avancés 🔭
- Rembobinage 🔄
- Voir visiteurs 👁️

### 🌟 Interaction avec les étoiles

#### Clic sur une étoile NETTE
Ouvre le modal profil détaillé avec :
- Photo grande taille
- Nom, âge, signe astrologique, ville
- Barre de compatibilité animée
- Infos astrologiques (Soleil, Lune, Ascendant)
- Bio complète
- 4 boutons d'action :
  - **💫 Signal** : Envoyer un signal (consomme 1 signal si gratuit)
  - **🌟 Super Nova** : Envoyer une Super Nova (Premium/Elite uniquement)
  - **💬 Message** : Envoyer un message (si match mutuel)
  - **❌ Passer** : Fermer et retirer cette étoile de la vue

#### Clic sur une étoile FLOUTÉE (gratuit)
Ouvre directement le modal upgrade pour passer à Premium

#### Clic sur une étoile SEMI-TRANSPARENTE (premium)
Ouvre le modal upgrade pour passer à Elite

### 🎨 Détails visuels

#### Badges sur les étoiles
- **MOI** : Badge violet pour utilisateur gratuit
- **💎 Premium** : Badge bleu en haut à droite
- **👑 Elite** : Badge doré avec animation shimmer

#### Animations
- `pulse-subtle` : Animation de pulsation légère sur toutes les étoiles
- `twinkle` : Scintillement des 60 petites étoiles en arrière-plan
- `float` : Flottement des particules dorées (Elite)
- `shimmer` : Effet de brillance sur les badges Elite
- `fade-in` : Apparition des toasts de notification

#### Hover
Au survol d'une étoile :
- Scale 1.15
- Z-index augmenté
- Shadow intensifiée
- Cursor pointer

### 📊 Données de démonstration

L'application contient 21 profils :
- 1 utilisateur (MOI) au centre (50%, 50%)
- 20 profils variés avec :
  - 4 profils très compatibles (90-100%) : Sophie, Lucas, Emma, Thomas
  - 8 profils compatibles (70-89%)
  - 8 profils neutres (<70%)
  - Répartition des plans : 15 gratuits, 3 premium, 2 elite

### 🧪 Tester les différents plans

Pour tester les plans, modifiez la ligne 21 dans `src/data/universeProfiles.ts` :

```typescript
plan: "gratuit",  // Changer en "premium" ou "elite"
```

Puis relancez l'application pour voir :
- Les différentes limitations visuelles
- Les compteurs qui changent
- Les boutons actifs/grisés selon le plan
- Les effets visuels spéciaux (Elite)

### 🎯 Comportement des boutons dans le modal profil

#### Bouton "💫 Signal"
- **Gratuit** : Affiche "(7/10)", actif si compteur > 0
  - Si 0 : grisé avec tooltip "Limite atteinte..."
- **Premium/Elite** : Affiche "(∞)", toujours actif

#### Bouton "🌟 Super Nova"
- **Gratuit** : Grisé avec icône 🔒 et texte "Premium requis"
  - Clic → Ouvre modal upgrade
- **Premium** : Affiche "(1/1)", actif si compteur > 0
  - Si 0 : tooltip "1 Super Nova par jour. Elite = 5 par jour"
- **Elite** : Affiche "(3/5)", actif si compteur > 0

#### Bouton "💬 Message"
- Actif si match mutuel, sinon grisé

#### Bouton "❌ Passer"
- Toujours actif
- Retire l'étoile de la vue avec fade out

### 📱 Responsive

L'application s'adapte automatiquement aux différentes tailles d'écran :
- Desktop : Layout complet avec tous les éléments visibles
- Tablet : Éléments légèrement compactés
- Mobile : Interface optimisée avec navigation bottom fixe

### 🔔 Notifications Toast

Les toasts apparaissent en bas de l'écran pendant 3 secondes pour :
- Signal envoyé ✓
- Super Nova envoyée 🌟
- Abonnement activé !
- Limites atteintes
- Erreurs diverses

## Technologies utilisées

- React 18+ avec hooks
- TypeScript
- Tailwind CSS (styles et animations)
- Lucide React (icônes)
- Lazy loading pour optimisation

## Fichiers créés

1. `src/data/universeProfiles.ts` : Données des 21 profils
2. `src/components/UniverseApp.tsx` : Composant principal (850+ lignes)
3. Animations CSS ajoutées dans `src/index.css`
4. Route ajoutée dans `src/App.tsx`

## Prochaines étapes possibles

- Intégration avec Supabase pour les données réelles
- Système de matching en temps réel
- Notifications push pour les signaux reçus
- Chat en temps réel avec les matchs
- Filtres avancés (âge, distance, signes)
- Mode incognito fonctionnel
- Système de rembobinage
- Statistiques de visite du profil
