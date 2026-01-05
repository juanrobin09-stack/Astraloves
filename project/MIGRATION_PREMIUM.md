# Migration vers Astra Premium - Guide Complet

## Changements CSS Appliqués ✅

### Polices Premium
- **Playfair Display**: Titres élégants (importée depuis Google Fonts)
- **Montserrat**: Textes corps (poids 300-700)

### Classes Premium Créées
```css
.premium-text - Glow blanc/rouge/or avec letter-spacing
.premium-text-sm - Version subtile
.premium-button - Bouton avec shimmer effect
.premium-card - Cartes velours avec backdrop blur
.premium-input - Inputs luxe
.premium-border - Bordures glow premium
.premium-glow - Effet glow rouge/or
.velvet-bg - Fond velours radial
.luxury-gradient - Dégradé noir velours
.animate-shimmer - Animation shimmer
```

### Palette Couleurs Premium
- Noir velours: `#000` à `#111`
- Rouge profond: `#c8102e`
- Glow or: `rgba(255, 215, 0, 0.1-0.2)`
- Glow blanc: `rgba(255, 255, 255, 0.3-0.4)`

## Changements Composants Appliqués ✅

### Remplacement Automatique
- `neon-*` → `premium-*` (toutes classes)
- `rose-*` → `red-*` (couleurs Tailwind)
- `#e11d48` → `#c8102e` (couleur hex)
- Fonds gris → velvet-bg

## Changements Requis pour Production

### 1. Retirer Références OpenAI

#### AstraChat.tsx
**Supprimer :**
```typescript
const [apiKey, setApiKey] = useState('');
const [showApiKeyInput, setShowApiKeyInput] = useState(true);
```

**Remplacer section API key par :**
```tsx
// Astra IA gérée en interne - aucune configuration requise
```

**Modifier appel API :**
```typescript
// AU LIEU DE:
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { 'Authorization': `Bearer ${apiKey}` }
});

// UTILISER:
const response = await fetch('/api/astra/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [...contextMessages, { role: 'user', content: userMessage }],
    userId: user!.id
  })
});
```

#### AttachmentQuestionnaire.tsx
**Supprimer prop apiKey:**
```typescript
// Retirer de props
type AttachmentQuestionnaireProps = {
  onBack: () => void;
  // apiKey: string; ← SUPPRIMER
};
```

**Modifier appel API similaire à AstraChat**

#### App.tsx
**Supprimer état apiKey:**
```typescript
// const [apiKey, setApiKey] = useState(''); ← SUPPRIMER
```

**Mettre à jour props:**
```tsx
<AstraChat onNavigate={...} /> // Pas de props apiKey
<AttachmentQuestionnaire onBack={...} /> // Pas de props apiKey
```

### 2. Backend API Routes

#### Créer `/api/astra/chat`
```typescript
import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // Côté serveur uniquement
});

export default async function handler(req, res) {
  const { messages, userId } = req.body;

  // Valider utilisateur
  const { data: profile } = await supabase
    .from('astra_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  // Vérifier limites
  if (!profile.is_premium && profile.daily_chat_count >= 5) {
    return res.status(429).json({ error: 'Limite atteinte' });
  }

  // Appel OpenAI
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Tu es Astra, un coach en amour éthique et fun, comme une étoile qui guide.
        Donne des conseils pratiques et respectueux sur la séduction, les relations, le développement personnel.
        JAMAIS de décision hâtive – propose des options, encourage à consulter un pro si c'est trop personnel.
        Utilise le profil et l'historique de l'utilisateur pour personnaliser.
        Inclusif, positif, avec des emojis. Si trop intime : redirige vers un professionnel.`
      },
      ...messages
    ],
    temperature: 0.8,
    max_tokens: 800
  });

  return res.json({
    message: completion.choices[0].message.content
  });
}
```

#### Créer `/api/astra/analyze-attachment`
```typescript
// Similaire pour le questionnaire d'attachement
// Gérer l'appel OpenAI côté serveur
```

### 3. Mise à Jour PrivacyPolicy.tsx

**Remplacer section "Utilisation de tes Données":**
```tsx
<h3>Utilisation de tes Données</h3>
<ul>
  <li>• Tes conversations ne sont <strong>JAMAIS</strong> partagées avec des tiers</li>
  <li>• Aucune donnée vendue ou exploitée à des fins publicitaires</li>
  <li>• Tes informations servent uniquement à personnaliser ton expérience avec Astra</li>
  <li>• <strong>Astra gère l'IA en interne</strong> – aucune clé API n'est demandée aux utilisateurs</li>
  <li>• Tout est sécurisé côté serveur par notre équipe</li>
  <li>• Tes données ne sont PAS utilisées pour entraîner l'IA</li>
</ul>
```

**Remplacer section "Important à Savoir":**
```tsx
<h3>Important à Savoir</h3>
<ul>
  <li>• Astra est une <strong>intelligence artificielle</strong> développée en interne, pas un professionnel qualifié</li>
  <li>• Ne partage jamais d'informations sensibles (données bancaires, santé, légales)</li>
  <li>• En cas de sujet grave, Astra te redirigera vers un professionnel</li>
  <li>• Backups automatiques quotidiens pour sécurité maximale</li>
  <li>• Conformité RGPD totale avec droit à l'effacement</li>
</ul>
```

### 4. Variables d'Environnement

#### Frontend (.env)
```env
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
```

#### Backend (.env)
```env
OPENAI_API_KEY=sk-xxx
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx
STRIPE_SECRET_KEY=sk_xxx
NODE_ENV=production
```

### 5. Améliorations UI Premium

#### Header
```tsx
<header className="fixed top-0 w-full premium-border bg-black/90 backdrop-blur-xl z-50">
  <div className="flex items-center justify-between px-8 py-4">
    <button className="premium-text-sm hover:premium-glow transition-all">
      Bonjour, {profile?.username} ✨
    </button>
    <div className="flex items-center gap-6">
      {profile?.is_premium && (
        <div className="premium-button px-4 py-2 rounded-full flex items-center gap-2">
          <Crown className="w-4 h-4" />
          <span className="text-sm font-semibold">Premium</span>
        </div>
      )}
      <button className="text-gray-400 hover:text-white">
        Déconnexion
      </button>
    </div>
  </div>
</header>
```

#### Chat Bulles
```tsx
<div className={`premium-card rounded-3xl px-8 py-6 max-w-[75%] ${
  message.role === 'user'
    ? 'ml-auto premium-button text-white'
    : 'premium-card text-gray-100'
}`}>
  <p className="text-lg leading-relaxed">{message.content}</p>
  <p className="text-xs opacity-60 mt-3">{time}</p>
</div>
```

#### Dashboard Cockpit
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-12">
  {stats.map(stat => (
    <div className="premium-card rounded-2xl p-10 hover:premium-glow transition-all duration-500">
      <div className="flex justify-center mb-6">
        <Icon className="w-16 h-16 text-#c8102e premium-glow" />
      </div>
      <h3 className="text-3xl font-bold text-center mb-3 premium-text-sm">
        {stat.value}
      </h3>
      <p className="text-gray-400 text-center text-lg">{stat.label}</p>
    </div>
  ))}
</div>
```

## Déploiement

### Structure
```
astra-premium/
├── frontend/          (React + Vite)
│   ├── src/
│   └── .env
├── backend/           (Node.js + Express)
│   ├── api/
│   │   └── astra/
│   │       ├── chat.ts
│   │       └── analyze.ts
│   ├── middleware/
│   └── .env
└── supabase/
    └── migrations/
```

### Commandes
```bash
# Frontend
npm run build
netlify deploy --prod

# Backend
npm start
# Ou: node --env-file=.env server.js
```

## Checklist Finale

- [ ] CSS premium appliqué
- [ ] Toutes classes neon → premium
- [ ] Polices Playfair + Montserrat chargées
- [ ] Références OpenAI supprimées
- [ ] Backend API routes créées
- [ ] Privacy Policy mise à jour
- [ ] Variables d'environnement configurées
- [ ] Espaces blancs généreux ajoutés
- [ ] Animations veloutées activées
- [ ] Tests E2E passés
- [ ] Build production réussi
- [ ] Déploiement vérifié

## Support

Pour toute question sur la migration premium:
- Documentation: `/docs/premium`
- Email: dev@astra.ai
