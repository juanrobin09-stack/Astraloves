# Structure des Questionnaires

## 📋 Vue d'ensemble

L'application utilise **deux systèmes de questionnaires distincts** :

1. **Questionnaire d'Onboarding** (inscription uniquement)
2. **Questionnaires Avancés** (utilisateurs existants)

---

## 🆕 1. QUESTIONNAIRE D'ONBOARDING

### Purpose
Collecte les informations de base lors de la **création de compte**.

### Quand ?
- **UNIQUEMENT** lors de l'inscription d'un nouveau compte
- **JAMAIS** accessible après l'inscription
- Ne figure **PAS** dans la liste des questionnaires disponibles

### Composants
- `OnboardingPage.tsx` - Flow complet d'onboarding
- `ProfileSetup.tsx` - Configuration du profil initial

### Informations collectées
```
✓ Nom, prénom, date de naissance
✓ Genre et recherche
✓ Ville et localisation
✓ Photos
✓ Heure de naissance (optionnel)
✓ Bio et objectifs
```

### Flow utilisateur
```
Signup → Email → OnboardingPage → Profile Complete → Dashboard
         (OTP)    (Nouveau compte)    (Première fois)
```

---

## 💎 2. QUESTIONNAIRES AVANCÉS

### Purpose
Analyses psychologiques approfondies pour utilisateurs **déjà inscrits**.

### Quand ?
- Disponibles **après inscription**
- Accessibles depuis la page "Questionnaires"
- Peuvent être complétés plusieurs fois

### Composants
- `QuestionnairesPage.tsx` - Liste des questionnaires disponibles
- `PremiumQuestionnaireFlow.tsx` - Flow interactif de complétion
- `QuestionnaireAnalysis.tsx` - Affichage des résultats
- `questionnaires.ts` - Configuration des questions

### Questionnaires disponibles

#### 💕 Style d'attachement (`attachment`)
- **15 questions**
- Identifie : Sécure, Évitant, Anxieux, Désorganisé
- Durée : ~10 minutes

#### ❤️ Compatibilité amoureuse (`compatibility`)
- **20 questions**
- Langages d'amour, valeurs, mode de vie
- Durée : ~15 minutes

#### 🌟 Archétype amoureux (`archetype`)
- **15 questions**
- 12 archétypes (Amant Passionné, Gardien, Aventurier, etc.)
- Durée : ~10 minutes

#### 🔮 Thème astral (`astral`)
- **20 questions**
- Vénus, Mars, Lune, 7e maison
- Durée : ~20 minutes

### Flow utilisateur
```
Dashboard → Questionnaires → Sélection → PremiumQuestionnaireFlow
                              (Premium)   (15-20 questions)
                                          ↓
                                          Génération OpenAI
                                          ↓
                                          QuestionnaireAnalysis
                                          (Résultats détaillés)
```

---

## 🤖 ANALYSE IA

### Moteur utilisé
**OpenAI GPT-4o** (pas Claude)

### Configuration
```env
VITE_OPENAI_API_KEY=sk-votre-clé-ici
```

### Prompt structure
```typescript
{
  role: 'system',
  content: 'Tu es un psychologue expert en relations amoureuses'
},
{
  role: 'user',
  content: `Analyse ${answers} du questionnaire ${title}`
}
```

### Format de réponse
```json
{
  "mainResult": "Type principal identifié",
  "description": "Explication détaillée (2-3 paragraphes)",
  "strengths": "Forces (3-4 points)",
  "attention": "Points d'attention (3-4 points)",
  "advice": "Conseils personnalisés (4-5 points)",
  "improvements": "Axes d'amélioration (3-4 points)"
}
```

### Sauvegarde
```sql
astra_questionnaire_results {
  user_id: uuid,
  questionnaire_id: text,
  answers: jsonb,
  ai_analysis: jsonb,  -- Résultat OpenAI
  completed_at: timestamp
}
```

---

## 🗂️ ORGANISATION DES FICHIERS

### Onboarding (Inscription)
```
/components/
  ├─ SignupPage.tsx       # Page d'inscription/connexion
  ├─ OnboardingPage.tsx   # Questionnaire initial (nouveaux comptes)
  └─ ProfileSetup.tsx     # Configuration profil
```

### Questionnaires Avancés (Post-inscription)
```
/components/
  ├─ QuestionnairesPage.tsx          # Liste + navigation
  ├─ PremiumQuestionnaireFlow.tsx    # Flow interactif
  └─ QuestionnaireAnalysis.tsx       # Affichage résultats

/data/
  └─ questionnaires.ts               # Configuration questions
```

---

## ⚠️ RÈGLES IMPORTANTES

### ❌ À NE PAS FAIRE

1. **Ne pas** mélanger onboarding et questionnaires avancés
2. **Ne pas** afficher l'onboarding dans QuestionnairesPage
3. **Ne pas** utiliser Claude (utiliser OpenAI uniquement)
4. **Ne pas** réutiliser `QuestionnaireFlow.tsx` (c'est pour l'onboarding)

### ✅ À FAIRE

1. **Onboarding** → `OnboardingPage.tsx` (nouveaux comptes uniquement)
2. **Questionnaires Premium** → `PremiumQuestionnaireFlow.tsx`
3. **Analyses IA** → OpenAI GPT-4o
4. **Sauvegarde** → `astra_questionnaire_results` table

---

## 🔐 ACCÈS PREMIUM

### Logique
```typescript
if (!isPremium) {
  // Afficher écran de verrouillage
  // Bouton "Passer à Premium"
} else {
  // Afficher liste complète des questionnaires
  // Permettre de commencer les questionnaires
}
```

### Vérification
```typescript
const { isPremium } = usePremiumStatus();
// Lecture depuis astra_profiles.is_premium
```

---

## 📊 STATISTIQUES

### Onboarding
- **1 questionnaire** (profil de base)
- **Obligatoire** pour tous les nouveaux comptes
- **Non répétable** après complétion

### Questionnaires Avancés
- **4 questionnaires** disponibles
- **70 questions au total** (15+20+15+20)
- **Répétables** à volonté
- **Premium requis** pour y accéder

---

## 🚀 DÉMARRAGE RAPIDE

### Pour tester l'onboarding
1. Créer un nouveau compte
2. Observer `OnboardingPage.tsx` automatiquement
3. Compléter le profil de base

### Pour tester les questionnaires avancés
1. Se connecter avec un compte existant
2. Avoir le statut Premium activé
3. Aller dans "Questionnaires" (bottom nav)
4. Choisir un questionnaire et le compléter
5. Voir l'analyse générée par OpenAI

---

## 🔧 MAINTENANCE

### Ajouter un nouveau questionnaire avancé
1. Éditer `/data/questionnaires.ts`
2. Ajouter l'entrée avec ID, titre, questions
3. Ajouter l'icône dans `PremiumQuestionnaireFlow.tsx` (ligne 199)
4. Créer la carte dans `QuestionnairesPage.tsx`

### Modifier les prompts OpenAI
1. Éditer `PremiumQuestionnaireFlow.tsx`
2. Fonction `generateAIAnalysis()` ligne 78-107
3. Ajuster le prompt selon les besoins

---

**Version** : 1.0
**Dernière mise à jour** : 29 novembre 2025
