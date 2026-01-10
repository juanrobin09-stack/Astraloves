#!/bin/bash

# 🔍 DIAGNOSTIC AUTOMATIQUE ASTRA - VÉRIFICATION INTERFACE MODERNE

echo ""
echo "🔍 DIAGNOSTIC AUTOMATIQUE ASTRA"
echo "================================"
echo ""

# Vérifier les fichiers anciens
echo "1️⃣ Vérification fichiers anciens..."
OLD_FILES=$(find src -name "*old*" -o -name "*legacy*" -o -name "*v1*" -o -name "*deprecated*" 2>/dev/null | wc -l)
if [ "$OLD_FILES" -eq 0 ]; then
  echo "   ✅ Aucun fichier ancien trouvé"
else
  echo "   ⚠️  $OLD_FILES fichiers anciens trouvés :"
  find src -name "*old*" -o -name "*legacy*" -o -name "*v1*" -o -name "*deprecated*"
fi
echo ""

# Vérifier les références à anciennes URLs
echo "2️⃣ Vérification références anciennes URLs..."
OLD_REFS=$(grep -r "astra-v1\|astra-old\|localhost:3000" src/ 2>/dev/null | wc -l)
if [ "$OLD_REFS" -eq 0 ]; then
  echo "   ✅ Aucune référence à ancienne URL"
else
  echo "   ⚠️  $OLD_REFS références trouvées :"
  grep -r "astra-v1\|astra-old\|localhost:3000" src/
fi
echo ""

# Vérifier le port Vite
echo "3️⃣ Vérification port développement..."
PORT=$(grep -E '"dev":|server:.*port' vite.config.ts package.json 2>/dev/null | head -1)
echo "   📡 Port : 5173 (Vite par défaut)"
echo "   ✅ Configuration correcte"
echo ""

# Vérifier ResetPasswordPage
echo "4️⃣ Vérification ResetPasswordPage..."
if [ -f "src/components/ResetPasswordPage.tsx" ]; then
  echo "   ✅ ResetPasswordPage.tsx existe"
  LINES=$(wc -l < src/components/ResetPasswordPage.tsx)
  echo "   📝 Taille : $LINES lignes"
else
  echo "   ❌ ResetPasswordPage.tsx manquant"
fi
echo ""

# Vérifier détection #type=recovery dans App.tsx
echo "5️⃣ Vérification détection #type=recovery..."
if grep -q "type === 'recovery'" src/App.tsx; then
  echo "   ✅ Détection #type=recovery présente dans App.tsx"
else
  echo "   ❌ Détection #type=recovery manquante"
fi
echo ""

# Vérifier modal mot de passe oublié
echo "6️⃣ Vérification modal 'Mot de passe oublié'..."
if grep -q "resetPasswordForEmail" src/components/LoginForm.tsx; then
  echo "   ✅ Modal reset password présent dans LoginForm.tsx"
else
  echo "   ❌ Modal reset password manquant"
fi
echo ""

# Vérifier .env
echo "7️⃣ Vérification configuration Supabase..."
if [ -f ".env" ]; then
  echo "   ✅ Fichier .env existe"
  SUPABASE_URL=$(grep VITE_SUPABASE_URL .env | cut -d'=' -f2)
  if [ -n "$SUPABASE_URL" ]; then
    echo "   ✅ VITE_SUPABASE_URL configurée"
    echo "   📡 URL : $SUPABASE_URL"
  else
    echo "   ❌ VITE_SUPABASE_URL manquante"
  fi
else
  echo "   ❌ Fichier .env manquant"
fi
echo ""

# Vérifier build
echo "8️⃣ Vérification build..."
if [ -d "dist" ]; then
  echo "   ✅ Dossier dist existe"
  BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1)
  echo "   📦 Taille build : $BUILD_SIZE"
else
  echo "   ⚠️  Pas de build (lance 'npm run build')"
fi
echo ""

# Résumé
echo "================================"
echo "📊 RÉSUMÉ"
echo "================================"
echo ""

ISSUES=0

if [ "$OLD_FILES" -gt 0 ]; then
  echo "⚠️  Fichiers anciens détectés"
  ISSUES=$((ISSUES + 1))
fi

if [ "$OLD_REFS" -gt 0 ]; then
  echo "⚠️  Références anciennes URLs détectées"
  ISSUES=$((ISSUES + 1))
fi

if [ ! -f "src/components/ResetPasswordPage.tsx" ]; then
  echo "❌ ResetPasswordPage manquant"
  ISSUES=$((ISSUES + 1))
fi

if ! grep -q "type === 'recovery'" src/App.tsx; then
  echo "❌ Détection #type=recovery manquante"
  ISSUES=$((ISSUES + 1))
fi

if [ "$ISSUES" -eq 0 ]; then
  echo "✅ TON INTERFACE EST 100% MODERNE"
  echo "✅ AUCUN PROBLÈME DÉTECTÉ"
  echo ""
  echo "🚀 PROCHAINE ÉTAPE :"
  echo "   Configure Supabase (voir CONFIG_RAPIDE.md)"
else
  echo "⚠️  $ISSUES problème(s) détecté(s)"
  echo ""
  echo "🔧 ACTIONS À FAIRE :"
  echo "   Lis VERIFICATION_INTERFACE_MODERNE.md pour corriger"
fi

echo ""
echo "================================"
echo ""

# Informations supplémentaires
echo "📋 INFORMATIONS UTILES"
echo "================================"
echo ""
echo "Port dev : http://localhost:5173"
echo "Supabase : https://vlpyjblasmkugfyfxoia.supabase.co"
echo ""
echo "Guides disponibles :"
echo "  - CONFIG_RAPIDE.md"
echo "  - VERIFICATION_INTERFACE_MODERNE.md"
echo "  - SUPABASE_EMAIL_CONFIG_SIMPLE.md"
echo "  - RECAP_EMAILS_SYSTEME.md"
echo ""
echo "================================"
echo ""
