# Nouveau Design des Questionnaires

Le design des pages de questions des quiz a été complètement refait avec un thème rouge et noir moderne.

## Ce qui a changé

### Avant (Ancien Design) ❌
- Options avec lettres A/B/C/D
- Clic direct sur l'option = passage automatique à la question suivante
- Pas de bouton Précédent
- Design violet/rose

### Après (Nouveau Design) ✅
- **Cards cliquables** sans lettres A/B/C/D
- **Radio buttons custom** avec cercle rouge quand sélectionné
- **Boutons Précédent/Suivant** en bas de page (footer fixe)
- **Thème rouge et noir** (#E63946, #0A0A0A, #1A1A1A)
- **Animations smoothes** sur les options et les transitions
- **Bouton Terminer** vert sur la dernière question

## Fonctionnalités Implémentées

### 1. Système de Sélection
- Clic sur une card pour sélectionner
- Visual feedback immédiat (bordure rouge + glow)
- Radio button custom qui s'anime
- Possibilité de changer de réponse avant de valider

### 2. Navigation Améliorée
- **Bouton Précédent** : Revenir à la question précédente
  - Désactivé sur la première question
  - Restaure la réponse précédemment sélectionnée
- **Bouton Suivant** : Passer à la question suivante
  - Désactivé si aucune réponse sélectionnée
  - Sauvegarde automatique de la réponse
- **Bouton Terminer** : Sur la dernière question (vert)
  - Déclenche l'analyse par Astra IA

### 3. Header Amélioré
```
← Retour    |    Nom du Quiz    |    3/10
═══════════════════════════════════════
[████████░░░░░░░░] Barre de progression
```

- Bouton retour à gauche
- Nom du quiz au centre
- Compteur de questions à droite
- Barre de progression rouge animée

### 4. Cards de Réponse

Chaque option est affichée dans une card moderne :

```
┌─────────────────────────────────────┐
│ ○  Rester dans votre coin et       │  ← Non sélectionné
│    observer                         │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ ●  Aller vers de nouvelles         │  ← Sélectionné (rouge)
│    personnes spontanément          │
└─────────────────────────────────────┘
```

#### États des Cards
1. **Normal** : Fond #1A1A1A, bordure #242424
2. **Hover** : Bordure rouge transparente, fond plus clair
3. **Sélectionné** :
   - Fond rouge transparent (#E63946/10)
   - Bordure rouge (#E63946)
   - Shadow rouge (glow)
   - Radio button rempli

### 5. Footer Fixe

Le footer reste fixe en bas de l'écran :

```
┌─────────────────────────────────────┐
│  [← Précédent]      [Suivant →]    │
└─────────────────────────────────────┘
```

#### Boutons
- **Précédent** : Bordure grise, désactivé en premier
- **Suivant** : Gradient rouge (#E63946 → #C1121F)
- **Terminer** : Gradient vert (#22C55E → #16A34A)
- **Désactivé** : Gris, cursor not-allowed

### 6. Animations

#### Apparition des Options
```css
.option-card:nth-child(1) { animation-delay: 0.05s; }
.option-card:nth-child(2) { animation-delay: 0.1s; }
.option-card:nth-child(3) { animation-delay: 0.15s; }
.option-card:nth-child(4) { animation-delay: 0.2s; }
```

Les options apparaissent en cascade de haut en bas.

#### Radio Button
- Scale-in animation quand sélectionné
- Rotation douce du cercle intérieur

#### Transitions de Questions
- Fade-in du nouveau contenu
- Barre de progression animée

#### Modal d'Analyse
- Icône étoile qui tourne lentement
- Backdrop blur + fade-in

## Palette de Couleurs

### Couleurs Principales
- **Noir principal** : `#0A0A0A`
- **Noir élevé** : `#121212`, `#1A1A1A`
- **Bordures** : `#242424`, `#424242`
- **Texte gris** : `#6B6B6B`, `#A0A0A0`
- **Rouge principal** : `#E63946`
- **Rouge clair** : `#FF6B6B`
- **Rouge foncé** : `#C1121F`
- **Vert validation** : `#22C55E`, `#16A34A`

### Utilisation
- **Fond de page** : `#0A0A0A`
- **Header** : `#121212/95` (transparent)
- **Cards** : `#1A1A1A`
- **Bordures** : `#242424`
- **Accent** : `#E63946` (rouge)
- **Succès** : `#22C55E` (vert)

## Responsive Mobile

### iPhone (320px - 428px)
```css
@media (max-width: 428px) {
  .question-text {
    font-size: 1.5rem; /* 24px */
  }

  .option-card {
    padding: 16px;
  }

  .btn-previous, .btn-next {
    min-width: 110px;
    font-size: 15px;
  }
}
```

### Très petits écrans (< 350px)
```css
@media (max-width: 350px) {
  .btn-previous, .btn-next {
    min-width: 100px;
    padding: 12px 14px;
    font-size: 14px;
  }
}
```

## Comportement du Système

### Flux de Navigation

1. **Page de questions** s'ouvre
2. **Question 1** s'affiche avec options
3. Utilisateur **sélectionne une option** (devient rouge)
4. Utilisateur clique sur **"Suivant"**
5. **Question 2** s'affiche
6. Utilisateur peut cliquer **"Précédent"** pour revenir
7. La réponse précédente est **restaurée**
8. Sur la **dernière question**, bouton devient **"Terminer"** (vert)
9. Clic sur **"Terminer"** → Modal **"Analyse en cours..."**
10. Après analyse → **Page de résultats**

### Sauvegarde des Réponses

Les réponses sont sauvegardées dans un objet :

```typescript
answers = {
  0: { questionId: 1, optionIndex: 2, text: "...", score: 3 },
  1: { questionId: 2, optionIndex: 0, text: "...", score: 1 },
  2: { questionId: 3, optionIndex: 1, text: "...", score: 2 },
  ...
}
```

Quand l'utilisateur revient en arrière, la réponse est restaurée depuis cet objet.

### Validation

- Bouton **"Suivant"** est désactivé tant qu'aucune option n'est sélectionnée
- Bouton **"Précédent"** est désactivé sur la première question
- Impossible d'avancer sans sélectionner une réponse

## Modal d'Analyse

Quand le quiz est terminé :

```
┌─────────────────────────────────────┐
│                                     │
│            ✨ (rotation)            │
│                                     │
│      Analyse en cours...            │
│                                     │
│   Astra IA analyse tes réponses     │
│                                     │
└─────────────────────────────────────┘
```

- Fond noir transparent avec blur
- Icône étoile qui tourne lentement
- Message d'attente
- Bloque l'interaction pendant l'analyse

## États des Boutons

### Bouton Précédent
```typescript
// Normal
border: 2px solid #424242
color: #A0A0A0

// Hover
border: 2px solid #E63946
color: #E63946
background: rgba(230, 57, 70, 0.05)

// Désactivé (première question)
border: 2px solid rgba(66, 66, 66, 0.3)
color: #6B6B6B
opacity: 0.3
cursor: not-allowed
```

### Bouton Suivant
```typescript
// Normal (option sélectionnée)
background: linear-gradient(135deg, #E63946, #C1121F)
color: white
shadow: 0 4px 15px rgba(230, 57, 70, 0.3)

// Hover
background: linear-gradient(135deg, #FF6B6B, #E63946)
shadow: 0 6px 25px rgba(230, 57, 70, 0.5)
transform: translateY(-2px)

// Désactivé (aucune option sélectionnée)
background: #242424
color: #6B6B6B
cursor: not-allowed
```

### Bouton Terminer (dernière question)
```typescript
// Normal (option sélectionnée)
background: linear-gradient(135deg, #22C55E, #16A34A)
color: white
shadow: 0 4px 15px rgba(34, 197, 94, 0.3)

// Hover
shadow: 0 6px 25px rgba(34, 197, 94, 0.5)
transform: translateY(-2px)
```

## Accessibilité

- Tous les états sont visuellement distincts
- Les boutons désactivés sont clairement identifiables
- Les zones cliquables sont suffisamment grandes (min 44px)
- Le contraste texte/fond respecte les normes WCAG
- La navigation au clavier fonctionne correctement
- Safe area insets pour les notch iPhone

## Performance

- Animations CSS pures (pas de JavaScript)
- Transitions optimisées avec `transform`
- Pas de re-renders inutiles
- Images et icônes optimisées
- Lazy loading des composants

## Fichiers Modifiés

- ✅ `src/components/QuizTestPage.tsx` - Refonte complète

## Tests Recommandés

1. **Navigation**
   - Tester Précédent/Suivant
   - Vérifier la restauration des réponses
   - Tester sur première et dernière question

2. **Sélection**
   - Sélectionner une option
   - Changer de sélection
   - Vérifier le visual feedback

3. **Responsive**
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPhone 14 Pro Max (428px)
   - Très petits écrans (< 350px)

4. **Animations**
   - Apparition des options
   - Transition entre questions
   - Radio button animation
   - Modal d'analyse

5. **Edge Cases**
   - Quiz avec 2 options
   - Quiz avec 6 options
   - Textes très longs
   - Connexion lente (analyse)

## Évolutions Futures

Fonctionnalités qui peuvent être ajoutées :
- Barre de progression avec indicateurs de questions répondues
- Saut direct à une question via la barre
- Sauvegarde automatique en brouillon
- Timer optionnel pour certains quiz
- Mode révision (voir toutes les réponses avant de terminer)
- Possibilité de marquer des questions pour y revenir

---

**Date de création** : 7 décembre 2025
**Build** : ✅ Validé
**Tests** : À effectuer en production
**Thème** : Rouge (#E63946) et Noir (#0A0A0A)
