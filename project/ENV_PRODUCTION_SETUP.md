# Configuration .env.production

## Créer le fichier .env.production

Créez manuellement le fichier `.env.production` à la racine du projet avec ce contenu :

```env
# URL de l'application en production
VITE_APP_URL=https://astraloves.com

# Environnement Node.js
NODE_ENV=production
```

## Note Importante

⚠️ **Ce fichier n'est PAS commité dans Git** (il est dans `.gitignore`) pour des raisons de sécurité.

Les variables d'environnement sensibles (Supabase, Stripe) doivent être configurées directement dans **Netlify Dashboard** → **Environment variables**.

## Variables à Configurer dans Netlify

Dans Netlify Dashboard, ajoutez ces variables :

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_STRIPE_PUBLIC_KEY`
- `VITE_APP_URL` (optionnel, déjà dans .env.production)
- `NODE_ENV` (optionnel, déjà dans .env.production)



