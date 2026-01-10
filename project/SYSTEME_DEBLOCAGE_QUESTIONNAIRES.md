# Système de Déblocage des Questionnaires

Le système complet de gestion d'accès aux questionnaires selon le niveau d'abonnement est maintenant implémenté.

## Ce qui a été implémenté

### 1. Service de Contrôle d'Accès (`src/lib/quizAccessControl.ts`)

Fonctionnalités principales :
- **Configuration des questionnaires** avec niveaux d'accès (free, premium, elite)
- **Vérification d'accès** : Vérifie si un utilisateur peut accéder à un questionnaire
- **Raisons de verrouillage** : Retourne le message approprié pour les questionnaires verrouillés
- **Système de badges** : Génère les badges corrects selon le statut (complété, inclus, verrouillé)
- **Groupement par catégorie** : Organise les questionnaires en 3 catégories

### 2. Hook React (`src/hooks/useQuizAccess.ts`)

Permet d'utiliser facilement le système dans les composants :
```typescript
const {
  userTier,           // 'free' | 'premium' | 'elite'
  checkAccess,        // Vérifie l'accès à un quiz
  getLockedReason,    // Obtient la raison du verrouillage
  getBadge,           // Obtient le badge à afficher
  categorizedQuizzes, // Questionnaires groupés par catégorie
  isPremium,          // true si premium ou elite
  isElite             // true si elite
} = useQuizAccess();
```

### 3. Configuration des Questionnaires

#### Questionnaires Gratuits (2)
- **Première Impression** 👋 - 10 questions - 5 min
- **Test de Séduction** 💋 - 12 questions - 7 min

#### Questionnaires Premium (3)
- **Style d'attachement** 💕 - 14 questions - 10 min
- **Archétype amoureux** 🌟 - 14 questions - 15 min
- **Test de compatibilité** ❤️ - 8 questions - 8 min

#### Questionnaires Elite (1)
- **Thème astral complet** ✨ - 15 questions - 12 min

### 4. Système de Badges

Chaque questionnaire affiche le bon badge selon la situation :

#### Pour utilisateur GRATUIT
- Questionnaires gratuits : Aucun badge ou "🎁 Gratuit"
- Questionnaires premium : **"💎 PREMIUM"** (grisé)
- Questionnaires elite : **"👑 ELITE"** (grisé)

#### Pour utilisateur PREMIUM
- Questionnaires gratuits : Aucun badge
- Questionnaires premium : **"💎 INCLUS"** (rouge)
- Questionnaires elite : **"👑 ELITE"** (grisé)

#### Pour utilisateur ELITE
- Questionnaires gratuits : Aucun badge
- Questionnaires premium : **"👑 INCLUS"** (or)
- Questionnaires elite : **"👑 INCLUS"** (or)

#### Pour questionnaires complétés (tous niveaux)
- **"✓ COMPLÉTÉ"** (vert)

### 5. Textes des Boutons

Les boutons changent selon l'accès :

#### Utilisateur a accès
```
▶️ Commencer le questionnaire
```

#### Utilisateur n'a pas accès - Gratuit vers Premium
```
🔒 Débloquer avec Premium
```

#### Utilisateur n'a pas accès - Gratuit vers Elite
```
🔒 Débloquer avec Elite
```

#### Utilisateur n'a pas accès - Premium vers Elite
```
🔒 Passer à Elite
```

#### Questionnaire complété
```
🔄 Refaire le test
```

## Hiérarchie d'Accès

Le système utilise une hiérarchie claire :

```
FREE → accès à : free
PREMIUM → accès à : free + premium
ELITE → accès à : free + premium + elite
```

## Affichage par Catégorie

Les questionnaires sont organisés en 3 sections :

### Section 1 : Questionnaires Gratuits
- Titre : "📋 Questionnaires Gratuits"
- Sous-titre : "Découvre les bases de ton profil"
- 2 questionnaires toujours accessibles

### Section 2 : Analyses Premium
- Titre adapté selon le tier :
  - Gratuit : "💎 Analyses Premium"
  - Premium/Elite : "Analyses Premium"
- Sous-titre : "Approfondis ta connaissance de toi-même"
- 3 questionnaires (débloqués avec Premium)

### Section 3 : Exclusif Elite
- Titre adapté selon le tier :
  - Gratuit/Premium : "👑 Exclusif Elite"
  - Elite : "Exclusif Elite"
- Sous-titre : "Le summum de l'analyse personnalisée"
- 1 questionnaire (débloqué avec Elite uniquement)

## Styles des Badges

### Badge Complété (vert)
```css
bg-green-500/20 border-green-500/30 text-green-400
```

### Badge Inclus Premium (rouge)
```css
bg-[#E63946]/20 border-[#E63946]/30 text-[#FF6B6B]
```

### Badge Inclus Elite (or)
```css
bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/20 border-[#FFD700]/30 text-[#FFD700]
```

### Badge Verrouillé (gris)
```css
bg-[#6B6B6B]/20 border-[#6B6B6B]/30 text-[#A0A0A0]
```

## Utilisation dans les Composants

### Exemple simple
```typescript
import { useQuizAccess } from '../hooks/useQuizAccess';

function MyComponent() {
  const { checkAccess, userTier } = useQuizAccess();

  const canDoQuiz = checkAccess('attachment');

  if (!canDoQuiz) {
    return <UpgradePrompt />;
  }

  return <QuizComponent />;
}
```

### Exemple avec catégories
```typescript
import { useQuizAccess } from '../hooks/useQuizAccess';

function QuizzesPage() {
  const { categorizedQuizzes } = useQuizAccess();

  return (
    <>
      {/* Gratuits */}
      {categorizedQuizzes.free.quizzes.map(quiz => (
        <QuizCard quiz={quiz} />
      ))}

      {/* Premium */}
      {categorizedQuizzes.premium.quizzes.map(quiz => (
        <QuizCard quiz={quiz} />
      ))}

      {/* Elite */}
      {categorizedQuizzes.elite.quizzes.map(quiz => (
        <QuizCard quiz={quiz} />
      ))}
    </>
  );
}
```

## Comportement Attendu

### Utilisateur Gratuit
- Voit 6 questionnaires au total
- Peut faire 2 questionnaires (gratuits)
- 4 questionnaires verrouillés avec boutons "Débloquer"
- Clic sur bouton verrouillé → redirection vers page d'abonnement

### Utilisateur Premium
- Voit 6 questionnaires au total
- Peut faire 5 questionnaires (gratuits + premium)
- 1 questionnaire verrouillé (elite)
- Badge "💎 INCLUS" sur les questionnaires premium
- Badge "👑 ELITE" (grisé) sur le questionnaire elite

### Utilisateur Elite
- Voit 6 questionnaires au total
- Peut faire TOUS les questionnaires (6)
- Aucun questionnaire verrouillé
- Badge "👑 INCLUS" sur tous les questionnaires premium et elite

## Détection du Tier

Le tier de l'utilisateur est détecté depuis plusieurs sources :
1. `user.premium_tier`
2. `user.subscription_tier`
3. `isPremium` (du hook usePremiumStatus)
4. Par défaut : 'free'

## Fichiers Modifiés

- ✅ `src/lib/quizAccessControl.ts` - Nouveau
- ✅ `src/hooks/useQuizAccess.ts` - Nouveau
- ✅ `src/components/QuizCard.tsx` - Mis à jour
- ✅ `src/components/QuestionnairesPage.tsx` - Mis à jour

## Tests Recommandés

1. **Utilisateur gratuit**
   - Vérifier que seuls 2 questionnaires sont accessibles
   - Vérifier les badges verrouillés
   - Tester le clic sur "Débloquer"

2. **Utilisateur premium**
   - Vérifier que 5 questionnaires sont accessibles
   - Vérifier les badges "💎 INCLUS"
   - Vérifier que le questionnaire elite est verrouillé

3. **Utilisateur elite**
   - Vérifier que tous les questionnaires sont accessibles
   - Vérifier les badges "👑 INCLUS"
   - Vérifier qu'aucun questionnaire n'est verrouillé

4. **Questionnaires complétés**
   - Vérifier le badge "✓ COMPLÉTÉ"
   - Vérifier le bouton "Refaire le test"

## Évolutions Futures

Fonctionnalités qui peuvent être ajoutées :
- Protection côté serveur (middleware)
- Analytics d'utilisation des questionnaires
- Notifications de nouveaux questionnaires
- Système de recommandation de questionnaires
- Prévisualisation des questionnaires verrouillés

---

**Date de création** : 7 décembre 2025
**Build** : ✅ Validé
**Tests** : À effectuer en production
