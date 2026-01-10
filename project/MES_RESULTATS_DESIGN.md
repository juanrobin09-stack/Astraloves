# 🌌 ONGLET "MES RÉSULTATS" - CONCEPTION COMPLÈTE

## 🎯 OBJECTIF

Créer un **journal cosmique personnel** où l'utilisateur voit :
- Sa progression dans l'univers ASTRA
- Ses questionnaires complétés
- Ses analyses IA
- Son évolution dans le temps
- Son thème astral (Elite)

**Principe clé** : L'utilisateur doit **ressentir sa montée en puissance** cosmique.

---

## 📊 STRUCTURE DE DONNÉES

### Table: quiz_results

```sql
CREATE TABLE quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  quiz_name TEXT NOT NULL,
  
  -- Résultats
  answers JSONB NOT NULL, -- Toutes les réponses
  score JSONB, -- Scores par dimension
  archetype TEXT, -- Ex: "Explorateur Émotionnel"
  summary TEXT, -- Résumé court
  
  -- Analyses IA
  ai_analysis TEXT, -- Analyse basique (tous)
  ai_analysis_advanced TEXT, -- Analyse Premium
  ai_analysis_elite TEXT, -- Analyse Elite complète
  
  -- Métadonnées
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tier_at_completion TEXT DEFAULT 'free', -- Tier au moment de compléter
  
  -- Progression
  insight_level INTEGER DEFAULT 1, -- 1=Free, 2=Premium, 3=Elite
  unlocked_features JSONB, -- Features débloquées
  
  UNIQUE(user_id, quiz_id)
);
```

### Table: astral_themes (Elite uniquement)

```sql
CREATE TABLE astral_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Données brutes
  birth_date DATE NOT NULL,
  birth_time TIME,
  birth_location TEXT,
  
  -- Éléments calculés
  sun_sign TEXT NOT NULL, -- Soleil
  moon_sign TEXT, -- Lune
  rising_sign TEXT, -- Ascendant
  
  -- Planètes
  mercury_sign TEXT,
  venus_sign TEXT,
  mars_sign TEXT,
  jupiter_sign TEXT,
  saturn_sign TEXT,
  
  -- Maisons (si heure connue)
  houses JSONB,
  
  -- Analyses
  dominant_element TEXT, -- Feu/Terre/Air/Eau
  dominant_modality TEXT, -- Cardinal/Fixe/Mutable
  personality_synthesis TEXT, -- Synthèse IA
  relationship_patterns TEXT, -- Patterns relationnels
  
  -- Évolution
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id)
);
```

### Table: insights_history

```sql
CREATE TABLE insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Type d'insight
  type TEXT NOT NULL, -- 'quiz', 'compatibility', 'horoscope', 'profile_tip'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- Contexte
  tier TEXT DEFAULT 'free',
  source_id UUID, -- ID du quiz ou autre
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_favorite BOOLEAN DEFAULT false,
  tags TEXT[]
);
```

---

## 🎨 INTERFACE PAR TIER

### 🌙 FREE (Découverte)

```
╔═══════════════════════════════════════╗
║         🌙 MES RÉSULTATS              ║
╠═══════════════════════════════════════╣
║                                       ║
║  📊 QUESTIONNAIRES COMPLÉTÉS          ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ ✅ Première Impression          │ ║
║  │ Complété le 10 janv. 2026       │ ║
║  │                                  │ ║
║  │ Résultat: "Observateur Social"  │ ║
║  │ [Voir résumé]                   │ ║
║  │                                  │ ║
║  │ 🔒 Analyse IA complète           │ ║
║  │    Disponible en Premium        │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🔒 Style d'Attachement          │ ║
║  │    Premium requis               │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🔒 Thème Astral Complet         │ ║
║  │    Elite requis                 │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  💡 2 questionnaires disponibles    ║
║  [Découvrir]                         ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Visible :**
- ✅ Liste des questionnaires complétés
- ✅ Résumé de base (archétype)
- ✅ Date de complétion
- 🔒 Analyses IA verrouillées (floutées)
- 🔒 Questionnaires premium (grisés)

**Interaction :**
- Click sur quiz complété → voir résumé basique
- Click sur analyse verrouillée → modal upgrade

---

### 💎 PREMIUM (Insights)

```
╔═══════════════════════════════════════╗
║      💎 MES RÉSULTATS PREMIUM         ║
╠═══════════════════════════════════════╣
║                                       ║
║  📈 PROGRESSION COSMIQUE              ║
║  ▓▓▓▓▓▓▓░░░ 7/10 questionnaires      ║
║                                       ║
║  🔮 INSIGHTS CETTE SEMAINE            ║
║  • Profil optimisé (+12% visibilité) ║
║  • Compatibilité analysée (4 profils)║
║  • Nouveau pattern identifié          ║
║                                       ║
║  ──────────────────────────────────   ║
║                                       ║
║  📊 QUESTIONNAIRES                    ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ ✨ Style d'Attachement           │ ║
║  │ Complété le 10 janv. 2026        │ ║
║  │                                   │ ║
║  │ Archétype: "Sécure-Autonome"     │ ║
║  │                                   │ ║
║  │ 🤖 ANALYSE IA PREMIUM             │ ║
║  │ Tu cherches l'équilibre entre    │ ║
║  │ proximité et indépendance. Tes   │ ║
║  │ relations sont stables mais tu   │ ║
║  │ as besoin d'espace personnel...  │ ║
║  │                                   │ ║
║  │ 💡 CONSEILS PERSONNALISÉS         │ ║
║  │ • Privilégie les partenaires     │ ║
║  │   qui comprennent ton besoin de  │ ║
║  │   temps seul                      │ ║
║  │ • Communique tes besoins dès le  │ ║
║  │   début                           │ ║
║  │                                   │ ║
║  │ [Refaire] [Partager]             │ ║
║  │                                   │ ║
║  │ 👑 Analyse Elite disponible       │ ║
║  │    Stratégie relationnelle +     │ ║
║  │    Thème astral croisé           │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  📊 HISTORIQUE DE COMPATIBILITÉ      ║
║  [Graphique évolution scores]        ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Visible :**
- ✅ Tous les questionnaires gratuits + premium
- ✅ Analyses IA avancées
- ✅ Conseils personnalisés
- ✅ Historique de compatibilité
- ✅ Progression cosmique
- ✅ Insights hebdomadaires
- 🔒 Thème astral complet (Elite)

**Nouveau :**
- Graphiques d'évolution
- Comparaison dans le temps
- Conseils actionnables

---

### 👑 ELITE (Maîtrise Cosmique)

```
╔═══════════════════════════════════════╗
║    👑 MAÎTRISE COSMIQUE ELITE         ║
╠═══════════════════════════════════════╣
║                                       ║
║  🌌 THÈME ASTRAL COMPLET              ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │     🌞 SOLEIL: Gémeaux           │ ║
║  │     🌙 LUNE: Cancer              │ ║
║  │     ⬆️ ASCENDANT: Scorpion        │ ║
║  │                                   │ ║
║  │  [Carte Natale Interactive]      │ ║
║  │                                   │ ║
║  │  🔥 Élément dominant: Air (60%)  │ ║
║  │  ⚡ Modalité: Mutable             │ ║
║  │                                   │ ║
║  │  💫 SYNTHÈSE PERSONNALITÉ         │ ║
║  │  Tu es naturellement curieux et  │ ║
║  │  adaptable (Gémeaux), avec une   │ ║
║  │  profonde sensibilité émotio...  │ ║
║  │                                   │ ║
║  │  💖 PATTERNS RELATIONNELS         │ ║
║  │  • Besoin de stimulation intel.  │ ║
║  │  • Sécurité émotionnelle...      │ ║
║  │                                   │ ║
║  │  [Voir détails complets]         │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  ──────────────────────────────────   ║
║                                       ║
║  📊 ANALYSES CROISÉES                 ║
║                                       ║
║  ┌─────────────────────────────────┐ ║
║  │ 🧠 Style d'Attachement × Astro  │ ║
║  │                                   │ ║
║  │ Ton attachement Sécure résonne   │ ║
║  │ avec ta Lune en Cancer. Tu       │ ║
║  │ cherches la stabilité émotio...  │ ║
║  │                                   │ ║
║  │ 🎯 STRATÉGIE RELATIONNELLE        │ ║
║  │ Avec ton Soleil Gémeaux et ta    │ ║
║  │ Lune Cancer, tu as besoin d'un   │ ║
║  │ partenaire qui:                   │ ║
║  │ • Stimule ton intellect           │ ║
║  │ • Rassure ton cœur                │ ║
║  │ • Comprend ton dualisme           │ ║
║  │                                   │ ║
║  │ Signes compatibles: Verseau,     │ ║
║  │ Balance, Poissons                 │ ║
║  └─────────────────────────────────┘ ║
║                                       ║
║  📈 ÉVOLUTION COSMIQUE                ║
║  [Timeline interactive]               ║
║  • Janv: Découverte personnalité     ║
║  • Fév: Compréhension attachement    ║
║  • Mars: Maîtrise thème astral       ║
║                                       ║
║  💡 INSIGHTS AVANCÉS                  ║
║  • Période favorable: Pleine Lune    ║
║  • Compatibilité optimale: 87%       ║
║  • Prochain transit important:...    ║
║                                       ║
╚═══════════════════════════════════════╝
```

**Visible :**
- ✅ TOUT débloqué
- ✅ Thème astral complet avec carte
- ✅ Analyses croisées (quiz × astro)
- ✅ Stratégies relationnelles avancées
- ✅ Timeline d'évolution
- ✅ Prédictions et transits
- ✅ Insights proactifs
- ✅ Coaching continu

**Unique :**
- Carte natale interactive
- Analyses multi-dimensionnelles
- Coaching stratégique
- Prédictions personnalisées

---

## 🔒 LOGIQUE DE VISIBILITÉ

### Règles de floutage

```typescript
function getResultVisibility(quiz: Quiz, userTier: PlanTier) {
  // Résumé basique toujours visible
  const baseVisible = {
    quizName: true,
    completedDate: true,
    archetype: true,
    shortSummary: true,
  };
  
  // Analyses IA par tier
  if (quiz.requiredTier === 'free') {
    return {
      ...baseVisible,
      basicAnalysis: true,
      advancedAnalysis: userTier !== 'free',
      eliteAnalysis: userTier === 'premium_elite',
    };
  }
  
  if (quiz.requiredTier === 'premium') {
    return {
      ...baseVisible,
      basicAnalysis: false, // Pas de version "basic" pour quiz premium
      advancedAnalysis: userTier === 'premium' || userTier === 'premium_elite',
      eliteAnalysis: userTier === 'premium_elite',
    };
  }
  
  if (quiz.requiredTier === 'premium_elite') {
    return {
      ...baseVisible,
      basicAnalysis: false,
      advancedAnalysis: false,
      eliteAnalysis: userTier === 'premium_elite',
    };
  }
}
```

### Affichage conditionnel

```tsx
function QuizResult({ quiz, userTier }) {
  const visibility = getResultVisibility(quiz, userTier);
  
  return (
    <div className="quiz-result">
      <h3>{quiz.name}</h3>
      <p>Complété le {quiz.completedDate}</p>
      
      {/* Toujours visible */}
      <div className="archetype">
        <strong>Archétype:</strong> {quiz.archetype}
      </div>
      
      {/* Analyse basique */}
      {visibility.basicAnalysis && (
        <div className="basic-analysis">
          {quiz.summary}
        </div>
      )}
      
      {/* Analyse avancée */}
      {visibility.advancedAnalysis ? (
        <div className="advanced-analysis">
          <h4>🤖 Analyse IA Premium</h4>
          <ReactMarkdown>{quiz.aiAnalysisAdvanced}</ReactMarkdown>
        </div>
      ) : (
        <LockedSection tier="premium">
          <BlurredText>Analyse IA avancée disponible...</BlurredText>
        </LockedSection>
      )}
      
      {/* Analyse Elite */}
      {visibility.eliteAnalysis ? (
        <div className="elite-analysis">
          <h4>👑 Coaching Elite</h4>
          <ReactMarkdown>{quiz.aiAnalysisElite}</ReactMarkdown>
        </div>
      ) : (
        <LockedSection tier="premium_elite">
          <BlurredText>Stratégie relationnelle Elite...</BlurredText>
        </LockedSection>
      )}
    </div>
  );
}
```

---

## 📈 SENTIMENT DE PROGRESSION

### Métriques visibles

**FREE**
```
🌙 Niveau Cosmique: Explorateur
▓░░░░░░░░░ 1/10

2 questionnaires complétés
7 insights découverts
```

**PREMIUM**
```
💎 Niveau Cosmique: Connaisseur
▓▓▓▓▓▓░░░░ 6/10

7 questionnaires complétés
24 insights découverts
12 compatibilités analysées
Profil optimisé (+18% visibilité)
```

**ELITE**
```
👑 Niveau Cosmique: Maître
▓▓▓▓▓▓▓▓▓▓ 10/10 ✨

TOUS les questionnaires complétés
Thème astral maîtrisé
42 insights découverts
Stratégies avancées actives
Coach IA Pro débloqué
```

### Badges de progression

```tsx
const COSMIC_BADGES = {
  'first_quiz': {
    icon: '🌟',
    title: 'Premier Pas',
    description: 'Premier questionnaire complété',
  },
  'all_free_quizzes': {
    icon: '🌙',
    title: 'Explorateur Complet',
    description: 'Tous les quiz gratuits complétés',
  },
  'first_premium_quiz': {
    icon: '💎',
    title: 'Éveil Premium',
    description: 'Premier quiz Premium complété',
  },
  'astral_theme_unlocked': {
    icon: '🌌',
    title: 'Révélation Cosmique',
    description: 'Thème astral débloqué',
  },
  'cosmic_master': {
    icon: '👑',
    title: 'Maître Cosmique',
    description: 'Tous les questionnaires Elite complétés',
  },
};
```

### Timeline d'évolution

```tsx
function CosmicTimeline({ insights }) {
  return (
    <div className="cosmic-timeline">
      {insights.map((insight, idx) => (
        <div key={idx} className="timeline-event">
          <div className="date">{insight.date}</div>
          <div className="milestone">
            <span className="icon">{insight.icon}</span>
            <h4>{insight.title}</h4>
            <p>{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Exemple de données
const timeline = [
  {
    date: '10 janv. 2026',
    icon: '🌟',
    title: 'Découverte de ton archétype',
    description: 'Observateur Social - Ta première analyse révèle...',
  },
  {
    date: '12 janv. 2026',
    icon: '💎',
    title: 'Passage Premium',
    description: 'Accès aux analyses avancées débloqué',
  },
  {
    date: '15 janv. 2026',
    icon: '🔮',
    title: 'Style d\'attachement identifié',
    description: 'Sécure-Autonome - Pattern relationnel découvert',
  },
];
```

---

## 🎯 COMPOSANTS PRINCIPAUX

### ResultsOverview

```tsx
function ResultsOverview() {
  const { tier, limits } = useFeatureAccess();
  const [results, setResults] = useState([]);
  const [astralTheme, setAstralTheme] = useState(null);
  
  return (
    <div className="results-page">
      {/* Header avec niveau */}
      <CosmicLevel tier={tier} results={results} />
      
      {/* Thème astral (Elite) */}
      {tier === 'premium_elite' && astralTheme && (
        <AstralThemeCard theme={astralTheme} />
      )}
      
      {/* Liste des quiz */}
      <QuizResultsList 
        results={results} 
        tier={tier}
        onUpgrade={() => setShowUpgradeModal(true)}
      />
      
      {/* Timeline */}
      {tier !== 'free' && (
        <CosmicTimeline insights={getInsights(results)} />
      )}
    </div>
  );
}
```

### AstralThemeCard (Elite uniquement)

```tsx
function AstralThemeCard({ theme }) {
  return (
    <div className="astral-theme-card">
      <h2>🌌 Ton Thème Astral</h2>
      
      <div className="big-three">
        <div>🌞 Soleil: {theme.sunSign}</div>
        <div>🌙 Lune: {theme.moonSign}</div>
        <div>⬆️ Ascendant: {theme.risingSign}</div>
      </div>
      
      <NatalChart data={theme} />
      
      <div className="synthesis">
        <h3>💫 Synthèse Personnalité</h3>
        <p>{theme.personalitySynthesis}</p>
      </div>
      
      <div className="relationship-patterns">
        <h3>💖 Patterns Relationnels</h3>
        <p>{theme.relationshipPatterns}</p>
      </div>
    </div>
  );
}
```

---

## ✅ CHECKLIST D'IMPLÉMENTATION

- [ ] Créer tables SQL (quiz_results, astral_themes, insights_history)
- [ ] Composant ResultsOverview
- [ ] Logique de visibilité par tier
- [ ] Floutage des contenus verrouillés
- [ ] Timeline d'évolution
- [ ] Badges de progression
- [ ] Carte natale interactive (Elite)
- [ ] Export PDF des résultats (Premium+)
- [ ] Partage social des archétypes
- [ ] Notifications de nouveaux insights

---

**L'utilisateur doit VOIR et RESSENTIR sa progression cosmique à chaque étape.**
