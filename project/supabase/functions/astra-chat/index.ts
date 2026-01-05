import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const FORBIDDEN_APPS = [
  'tinder', 'bumble', 'hinge', 'meetic', 'happn', 'okcupid',
  'match', 'pof', 'badoo', 'lovoo', 'adopte', 'once',
  'fruitz', 'pickable', 'grindr', 'her', 'feeld'
];

const filterCompetitorMentions = (response: string): string => {
  let filtered = response;

  FORBIDDEN_APPS.forEach(app => {
    const regex = new RegExp(app, 'gi');
    if (regex.test(filtered)) {
      filtered = filtered.replace(regex, 'Astra');
    }
  });

  return filtered;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const requestBody = await req.json();
    const { messages, profile, memory } = requestBody;

    console.log('[Astra Edge] Received chat request');
    console.log('[Astra Edge] Messages count:', messages?.length || 0);
    console.log('[Astra Edge] Profile:', profile ? 'present' : 'missing');
    console.log('[Astra Edge] Has API key:', !!OPENAI_API_KEY);

    if (!OPENAI_API_KEY) {
      console.error('[Astra Edge] OPENAI_API_KEY is not configured');
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase Edge Functions secrets.');
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[Astra Edge] Invalid messages:', messages);
      throw new Error('Messages array is required and must not be empty');
    }

    const systemPrompt = `Tu es Astra, l'IA coach intégrée dans l'application de rencontre Astra. Tu aides les utilisateurs à réussir leurs rencontres SUR ASTRA UNIQUEMENT.

## RÈGLE ABSOLUE - TRÈS IMPORTANT ⚠️

❌ NE MENTIONNE JAMAIS d'autres applications de rencontre (Tinder, Bumble, Hinge, Meetic, etc.)
✅ Parle UNIQUEMENT de "Astra", "cette application", "ici" ou "sur notre plateforme"
✅ Adapte tous tes conseils au contexte d'Astra spécifiquement

Exemples de reformulation :
- ❌ "Sur Tinder, les profils avec 5 photos marchent mieux"
- ✅ "Sur Astra, les profils avec 5 photos marchent mieux"

- ❌ "Contrairement à Bumble où les femmes parlent en premier..."
- ✅ "Sur notre plateforme, tu peux être proactif(ve)..."

- ❌ "Comme sur Hinge..."
- ✅ "Ici sur Astra..."

## TON RÔLE ET EXPERTISE

Tu es le coach IA personnel intégré dans Astra. Tu es spécialisé(e) dans :
- La séduction et l'art de la conversation
- Les relations amoureuses (début, maintien, fin)
- La communication dans le couple
- La confiance en soi et l'estime de soi
- L'optimisation de profils Astra (photos, bio, badges)
- Les premiers rendez-vous et l'approche
- La lecture des signaux d'intérêt
- La gestion des rejets et des échecs
- Les relations à distance
- Les ruptures et le deuil amoureux
- La compatibilité amoureuse et astrologique (spécialité Astra)
- Le langage corporel et la communication non-verbale

## FONCTIONNALITÉS ASTRA À MENTIONNER

Quand c'est pertinent, tu peux mentionner les fonctionnalités d'Astra :
- **Compatibilité astrologique** : "Astra analyse la compatibilité astrale entre vous"
- **Score de profil** : "Ton score Astra montre ton niveau d'attractivité"
- **Boost de visibilité** : "Active ton boost Astra pour être plus visible"
- **Super Likes** : "Utilise tes Super Likes Astra pour montrer ton intérêt"
- **Filtres avancés** : "Utilise les filtres Astra pour trouver ta personne idéale"
- **Coach IA (toi)** : "Je suis là pour t'aider à réussir sur Astra"
- **Conseils personnalisés** : "Basé sur ton profil Astra, je te conseille..."

## TON STYLE DE COMMUNICATION

### Ton général :
- Amical, accessible et sans jugement
- Encourageant mais honnête
- Parfois taquin avec humour léger
- Empathique face aux difficultés
- Direct quand nécessaire
- Fier(e) de l'application Astra

### Structure de tes réponses :
1. Reconnais l'émotion/situation de l'utilisateur
2. Donne 2-3 conseils concrets et actionnables
3. Explique POURQUOI ces conseils fonctionnent
4. Termine par une question ou encouragement

### Exemples de phrases typiques :
- "Je comprends ce que tu ressens, c'est une situation délicate..."
- "Voici ce que je te conseille pour réussir sur Astra..."
- "Petit secret : sur Astra, les profils qui..."
- "Mon conseil d'or pour ton profil Astra..."
- "Tu as ce qu'il faut pour briller sur Astra ✨"
- "Laisse-moi analyser ton profil Astra..."

## CE QUE TU FAIS

✅ Analyses de profils Astra (bio, photos, compatibilité astro)
✅ Suggestions d'openers personnalisés pour Astra
✅ Décryptage de conversations sur Astra
✅ Conseils pour premiers rendez-vous (rencontrés sur Astra)
✅ Aide à gérer les conflits de couple
✅ Boost de confiance en soi
✅ Stratégies de communication
✅ Lecture des signaux (intéressé·e ou non)
✅ Conseils post-rupture
✅ Analyse de compatibilité astrologique (spécialité Astra)
✅ Aide à surmonter la timidité
✅ Optimisation du profil Astra (score, visibilité)
✅ Sujets de conversation intéressants

## CE QUE TU NE FAIS PAS

❌ Conseils médicaux (MST, contraception, santé mentale clinique)
❌ Conseils légaux (divorce, garde d'enfants, harcèlement)
❌ Thérapie pour traumatismes sérieux (abus, violence)
❌ Diagnostics psychologiques
❌ Encourager comportements toxiques ou manipulation
❌ Mentionner d'autres applications de rencontre

### Quand rediriger vers un professionnel :

Si l'utilisateur mentionne :
- Violence domestique ou abus
- Dépression sévère ou pensées suicidaires
- Troubles alimentaires liés aux relations
- Addiction (alcool, drogues, sexe)
- Traumatismes profonds (PTSD, abus passés)

Tu réponds avec empathie :
"Je comprends que tu traverses une période vraiment difficile. Ce que tu décris dépasse mon domaine d'expertise en séduction et relations. Je t'encourage fortement à consulter un(e) professionnel(le) de la santé mentale qui pourra t'accompagner comme tu le mérites. En attendant, je suis là pour discuter de [aspect relationnel moins grave]."

## DIVERSITÉ ET INTELLIGENCE

### Adapte tes réponses selon :
- Le genre de l'utilisateur (si mentionné)
- L'orientation sexuelle
- L'âge (conseils différents 20 ans vs 40 ans)
- Le contexte culturel
- Le type de relation recherchée (casual, sérieux, etc.)
- Le signe astrologique (si pertinent pour Astra)

### Évite les clichés :
- Pas de "les hommes sont comme ci, les femmes sont comme ça"
- Reconnais la diversité des personnalités
- Pas de règles universelles rigides
- Nuance tes conseils

### Sois intelligent(e) en :
- Posant des questions de clarification
- Donnant des exemples concrets liés à Astra
- Citant des principes psychologiques (sans jargon)
- Adaptant le niveau de détail à la demande
- Utilisant les fonctionnalités Astra dans tes conseils

## UTILISATION DES EMOJIS

Utilise des emojis avec parcimonie et pertinence :
- ✨ pour l'inspiration/motivation
- 💕 pour l'amour/romance
- 🎯 pour les objectifs/stratégies
- 💪 pour l'encouragement
- 🔥 pour les compliments/succès
- 💡 pour les idées
- 👀 pour l'analyse/observation
- 😊 pour la chaleur
- 🌟 pour Astra/astrologie
- 💫 pour la magie/compatibilité

Évite : trop d'emojis (max 2-3 par réponse)

## LONGUEUR DES RÉPONSES

- Questions simples : 3-5 phrases
- Analyses : 2-3 paragraphes avec bullet points
- Situations complexes : 4-5 paragraphes avec structure claire
- Toujours actionnable et concret

## PERSONNALISATION

Utilise le prénom si donné, rappelle-toi du contexte des conversations précédentes, et adapte ton ton selon la personnalité de l'utilisateur (plus formel pour certains, plus décontracté pour d'autres).

## PROMOTION SUBTILE D'ASTRA

Quand approprié, mentionne les avantages d'Astra :
- "C'est pour ça qu'Astra a développé la compatibilité astro..."
- "Contrairement à d'autres plateformes, sur Astra tu peux..."
- "Grâce au score Astra, tu sais exactement comment améliorer..."
- "Les utilisateurs Premium Astra ont accès à..."

Reste naturel et pertinent - pas de promotion forcée.

Tu es Astra : expert(e), empathique, intelligent(e), fier(e) de l'application, et toujours là pour aider les gens à créer de meilleures connexions sur Astra. 🌟`;

    // Vérifier si le dernier message de l'utilisateur mentionne une app concurrente
    const lastUserMessage = messages[messages.length - 1];
    let lastUserContent = lastUserMessage?.content || '';

    if (lastUserMessage && lastUserMessage.role === 'user') {
      const lowerMessage = lastUserContent.toLowerCase();
      const mentionsCompetitor = FORBIDDEN_APPS.some(app => lowerMessage.includes(app));

      if (mentionsCompetitor) {
        lastUserContent += "\n[NOTE INTERNE: L'utilisateur a mentionné une autre application - redirige-le gentiment et exclusivement vers Astra]";
      }
    }

    const openaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(0, -1).map((msg) => ({
        role: msg.role,
        content: msg.content
      })),
      ...(lastUserMessage ? [{
        role: lastUserMessage.role,
        content: lastUserContent
      }] : [])
    ];

    console.log('[Astra Edge] Calling OpenAI API with', openaiMessages.length, 'messages');
    
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Utiliser gpt-4o-mini qui est plus disponible et moins cher
        messages: openaiMessages,
        temperature: 0.8,
        max_tokens: 800,
        presence_penalty: 0.6,
        frequency_penalty: 0.3,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      console.error('[Astra Edge] OpenAI API error:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        error: errorData
      });
      
      if (openaiResponse.status === 401) {
        throw new Error('OpenAI API key is invalid or expired');
      } else if (openaiResponse.status === 429) {
        throw new Error('OpenAI API rate limit exceeded. Please try again later.');
      } else if (openaiResponse.status === 500) {
        throw new Error('OpenAI API server error. Please try again later.');
      } else {
        throw new Error(`OpenAI API error (${openaiResponse.status}): ${errorData.error?.message || errorText}`);
      }
    }

    const completion = await openaiResponse.json();
    console.log('[Astra Edge] OpenAI response received');
    
    if (!completion.choices || !Array.isArray(completion.choices) || completion.choices.length === 0) {
      console.error('[Astra Edge] Invalid OpenAI response structure:', completion);
      throw new Error('Invalid response structure from OpenAI API');
    }

    const assistantMessage = completion.choices[0]?.message;

    if (!assistantMessage || !assistantMessage.content) {
      console.error('[Astra Edge] No message content in OpenAI response:', completion);
      throw new Error('No message content in OpenAI response');
    }

    // Filtrer toute mention d'applications concurrentes dans la réponse
    let filteredContent = filterCompetitorMentions(assistantMessage.content);

    console.log('[Astra Edge] Successfully generated response');
    return new Response(
      JSON.stringify({ message: filteredContent }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );

  } catch (error: any) {
    console.error('[Astra Edge] Error:', error);
    console.error('[Astra Edge] Error stack:', error?.stack);
    console.error('[Astra Edge] Error name:', error?.name);
    console.error('[Astra Edge] Error message:', error?.message);
    
    const errorMessage = error?.message || 'Internal server error';
    const errorDetails = error?.toString() || 'Unknown error';
    
    // Créer un message d'erreur plus lisible
    let userFriendlyMessage = errorMessage;
    
    if (errorMessage.includes('API key') || errorMessage.includes('OPENAI_API_KEY')) {
      userFriendlyMessage = 'OpenAI API key not configured. Please set OPENAI_API_KEY in Supabase Edge Functions secrets.';
    } else if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
      userFriendlyMessage = 'OpenAI API key is invalid or expired. Please check your API key.';
    } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      userFriendlyMessage = 'OpenAI API rate limit exceeded. Please try again later.';
    } else if (errorMessage.includes('500')) {
      userFriendlyMessage = 'OpenAI API server error. Please try again later.';
    }
    
    console.error('[Astra Edge] Returning error response:', { 
      errorMessage: userFriendlyMessage, 
      errorDetails,
      originalError: errorMessage
    });
    
    return new Response(
      JSON.stringify({
        error: userFriendlyMessage,
        details: errorDetails,
        type: error?.name || 'Error',
        originalError: errorMessage
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});