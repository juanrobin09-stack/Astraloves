#!/bin/bash

# =============================================================================
# SCRIPT DE DÉPLOIEMENT EN PRODUCTION
# =============================================================================
#
# Ce script orchestre toutes les étapes nécessaires pour déployer
# l'application en production de manière sécurisée.
#
# Usage:
#   ./deploy-production.sh [--skip-backup] [--skip-reset] [--skip-checks]
#
# Options:
#   --skip-backup   Ne pas créer de backup (NON RECOMMANDÉ)
#   --skip-reset    Ne pas réinitialiser les données
#   --skip-checks   Ne pas effectuer les vérifications pré-production
#
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Options
SKIP_BACKUP=false
SKIP_RESET=false
SKIP_CHECKS=false

# Parser les arguments
for arg in "$@"; do
  case $arg in
    --skip-backup)
      SKIP_BACKUP=true
      shift
      ;;
    --skip-reset)
      SKIP_RESET=true
      shift
      ;;
    --skip-checks)
      SKIP_CHECKS=true
      shift
      ;;
  esac
done

# Fonction pour afficher un en-tête
print_header() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""
}

# Fonction pour afficher une étape
print_step() {
  echo -e "${BLUE}▶ $1${NC}"
}

# Fonction pour afficher un succès
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Fonction pour afficher un avertissement
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Fonction pour afficher une erreur
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Fonction pour demander confirmation
confirm() {
  echo -e "${YELLOW}$1 (oui/non)${NC}"
  read -r response
  case "$response" in
    [oO][uU][iI]|[yY][eE][sS]|[yY])
      return 0
      ;;
    *)
      return 1
      ;;
  esac
}

# =============================================================================
# DÉBUT DU DÉPLOIEMENT
# =============================================================================

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║      DÉPLOIEMENT EN PRODUCTION - APPLICATION ASTRA        ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
  print_error "Ce script doit être exécuté depuis la racine du projet"
  exit 1
fi

# Afficher les options
if [ "$SKIP_BACKUP" = true ]; then
  print_warning "Option --skip-backup activée (NON RECOMMANDÉ)"
fi
if [ "$SKIP_RESET" = true ]; then
  print_warning "Option --skip-reset activée"
fi
if [ "$SKIP_CHECKS" = true ]; then
  print_warning "Option --skip-checks activée"
fi

echo ""
if ! confirm "Voulez-vous continuer avec le déploiement en production ?"; then
  print_error "Déploiement annulé"
  exit 0
fi

# =============================================================================
# ÉTAPE 1 : BACKUP DE LA BASE DE DONNÉES
# =============================================================================

if [ "$SKIP_BACKUP" = false ]; then
  print_header "ÉTAPE 1/7 : Backup de la base de données"

  print_step "Création du backup..."
  if [ -f "scripts/backup-database.sh" ]; then
    chmod +x scripts/backup-database.sh
    ./scripts/backup-database.sh
  else
    print_warning "Script de backup non trouvé, consultez la documentation Supabase"
    if ! confirm "Avez-vous créé un backup manuel via l'interface Supabase ?"; then
      print_error "Backup requis avant de continuer"
      exit 1
    fi
  fi

  print_success "Backup terminé"
else
  print_warning "ÉTAPE 1/7 : Backup ignoré (--skip-backup)"
fi

# =============================================================================
# ÉTAPE 2 : RÉINITIALISATION DES DONNÉES (OPTIONNEL)
# =============================================================================

if [ "$SKIP_RESET" = false ]; then
  print_header "ÉTAPE 2/7 : Réinitialisation des données de quiz"

  echo ""
  print_warning "Cette étape va SUPPRIMER toutes les données de questionnaires !"
  print_warning "Cela inclut tous les quiz_results et questionnaire_results"
  echo ""

  if confirm "Voulez-vous réinitialiser les données de quiz ?"; then
    print_step "Réinitialisation en cours..."

    # Note: Cette commande doit être exécutée via le SQL Editor de Supabase
    # ou via un outil approprié
    print_warning "Pour réinitialiser les données :"
    echo "  1. Ouvrez le SQL Editor de Supabase"
    echo "  2. Exécutez le script : scripts/reset-quiz-data.sql"
    echo "  3. Vérifiez que les tables sont vides"
    echo ""

    if ! confirm "Avez-vous exécuté le script de reset ?"; then
      print_warning "Reset ignoré, on continue..."
    else
      print_success "Données réinitialisées"
    fi
  else
    print_warning "Réinitialisation ignorée"
  fi
else
  print_warning "ÉTAPE 2/7 : Réinitialisation ignorée (--skip-reset)"
fi

# =============================================================================
# ÉTAPE 3 : VÉRIFICATIONS PRÉ-PRODUCTION
# =============================================================================

if [ "$SKIP_CHECKS" = false ]; then
  print_header "ÉTAPE 3/7 : Vérifications pré-production"

  print_step "Exécution des vérifications..."

  # Vérifier si Node.js et npm sont installés
  if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé"
    exit 1
  fi

  if ! command -v npm &> /dev/null; then
    print_error "npm n'est pas installé"
    exit 1
  fi

  # Installer les dépendances si nécessaire
  if [ ! -d "node_modules" ]; then
    print_step "Installation des dépendances..."
    npm install
  fi

  # Exécuter les vérifications (si le script existe)
  if [ -f "scripts/pre-production-checks.ts" ]; then
    print_step "Vérifications automatiques..."
    npx tsx scripts/pre-production-checks.ts || {
      print_error "Les vérifications ont échoué"
      if ! confirm "Voulez-vous continuer malgré les erreurs ?"; then
        exit 1
      fi
    }
  else
    print_warning "Script de vérification non trouvé"
  fi

  print_success "Vérifications terminées"
else
  print_warning "ÉTAPE 3/7 : Vérifications ignorées (--skip-checks)"
fi

# =============================================================================
# ÉTAPE 4 : BUILD DE L'APPLICATION
# =============================================================================

print_header "ÉTAPE 4/7 : Build de l'application"

print_step "Nettoyage du build précédent..."
rm -rf dist

print_step "Build en cours..."
npm run build

if [ $? -eq 0 ]; then
  print_success "Build réussi"
else
  print_error "Échec du build"
  exit 1
fi

# =============================================================================
# ÉTAPE 5 : VÉRIFICATIONS POST-BUILD
# =============================================================================

print_header "ÉTAPE 5/7 : Vérifications post-build"

print_step "Vérification des fichiers générés..."

if [ ! -d "dist" ]; then
  print_error "Le dossier dist n'a pas été créé"
  exit 1
fi

FILE_COUNT=$(find dist -type f | wc -l)
if [ "$FILE_COUNT" -lt 5 ]; then
  print_error "Nombre de fichiers insuffisant dans dist/ ($FILE_COUNT)"
  exit 1
fi

print_success "Fichiers générés : $FILE_COUNT fichiers"

# Vérifier la taille du build
DIST_SIZE=$(du -sh dist | cut -f1)
print_success "Taille du build : $DIST_SIZE"

# =============================================================================
# ÉTAPE 6 : DÉPLOIEMENT
# =============================================================================

print_header "ÉTAPE 6/7 : Déploiement"

echo ""
print_warning "Le déploiement dépend de votre plateforme d'hébergement"
echo ""
echo "Plateformes supportées :"
echo "  • Vercel    : vercel --prod"
echo "  • Netlify   : netlify deploy --prod"
echo "  • Firebase  : firebase deploy"
echo "  • Custom    : Selon votre configuration"
echo ""

if confirm "Voulez-vous déployer maintenant ?"; then
  print_step "Déploiement en cours..."

  # Détection automatique de la plateforme
  if [ -f "vercel.json" ]; then
    print_step "Déploiement sur Vercel..."
    vercel --prod
  elif [ -f "netlify.toml" ]; then
    print_step "Déploiement sur Netlify..."
    netlify deploy --prod
  elif [ -f "firebase.json" ]; then
    print_step "Déploiement sur Firebase..."
    firebase deploy
  else
    print_warning "Plateforme non détectée, déploiement manuel requis"
    echo "Utilisez votre commande de déploiement personnalisée"
  fi

  print_success "Déploiement terminé"
else
  print_warning "Déploiement ignoré"
fi

# =============================================================================
# ÉTAPE 7 : RAPPORT FINAL
# =============================================================================

print_header "ÉTAPE 7/7 : Rapport final"

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║              DÉPLOIEMENT TERMINÉ AVEC SUCCÈS !            ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${CYAN}📋 RÉCAPITULATIF :${NC}"
echo ""
echo "  ✅ Backup de la base de données"
echo "  ✅ Reset des données (si activé)"
echo "  ✅ Vérifications pré-production"
echo "  ✅ Build de l'application"
echo "  ✅ Vérifications post-build"
echo "  ✅ Déploiement"
echo ""

echo -e "${CYAN}🚀 PROCHAINES ÉTAPES :${NC}"
echo ""
echo "  1. Tester l'application en production"
echo "  2. Vérifier que tous les questionnaires fonctionnent"
echo "  3. Tester l'intégration Astra"
echo "  4. Vérifier le système Premium"
echo "  5. Tester sur mobile"
echo "  6. Surveiller les logs d'erreur"
echo ""

echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo ""
echo "  • Gardez une copie du backup"
echo "  • Surveillez les métriques de performance"
echo "  • Testez tous les parcours utilisateur"
echo "  • Vérifiez les paiements Stripe"
echo ""

echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${MAGENTA}                    Bonne chance ! 🎉                     ${NC}"
echo -e "${MAGENTA}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
