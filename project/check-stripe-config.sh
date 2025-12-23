#!/bin/bash

echo "================================================"
echo "🔍 VÉRIFICATION CONFIGURATION STRIPE"
echo "================================================"
echo ""

# Charger le fichier .env
if [ ! -f .env ]; then
    echo "❌ ERREUR : Fichier .env introuvable"
    exit 1
fi

source .env

echo "📋 CHECKLIST DES VARIABLES STRIPE :"
echo ""

# Variables obligatoires
missing=0

check_var() {
    local var_name=$1
    local var_value=${!var_name}

    if [ -z "$var_value" ]; then
        echo "❌ $var_name : NON CONFIGURÉE"
        ((missing++))
    else
        echo "✅ $var_name : CONFIGURÉE (${var_value:0:20}...)"
    fi
}

# Clés principales
check_var "STRIPE_SECRET_KEY"
check_var "STRIPE_WEBHOOK_SECRET"

echo ""
echo "📦 PRIX DES ABONNEMENTS :"
check_var "STRIPE_PRICE_PREMIUM"
check_var "STRIPE_PRICE_PREMIUM_PLUS"

echo ""
echo "================================================"
if [ $missing -eq 0 ]; then
    echo "✅ PARFAIT ! Toutes les variables sont configurées"
    echo ""
    echo "🚀 Tu peux maintenant :"
    echo "   1. Tester les paiements avec la carte test : 4242 4242 4242 4242"
    echo "   2. Vérifier les webhooks dans Dashboard Stripe"
    echo "   3. Consulter les logs dans la table stripe_webhook_logs"
else
    echo "⚠️  ATTENTION : $missing variable(s) manquante(s)"
    echo ""
    echo "📖 Consulte le guide : STRIPE_SETUP_GUIDE.md"
    echo "🔧 Remplis le fichier .env avec tes clés Stripe"
fi
echo "================================================"
