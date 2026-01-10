#!/bin/bash

# =============================================================================
# SCRIPT DE BACKUP DE LA BASE DE DONNÉES SUPABASE
# =============================================================================
#
# Ce script crée un backup complet de la base de données avant toute
# opération de reset ou de déploiement.
#
# Usage:
#   ./backup-database.sh
#
# IMPORTANT: Nécessite les variables d'environnement Supabase configurées
# =============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/supabase_backup_${TIMESTAMP}.sql"

# Vérifier que le répertoire de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
  echo -e "${BLUE}📁 Création du répertoire de backup...${NC}"
  mkdir -p "$BACKUP_DIR"
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║        BACKUP DE LA BASE DE DONNÉES SUPABASE              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier les variables d'environnement
if [ -z "$SUPABASE_DB_URL" ]; then
  echo -e "${RED}❌ Erreur: SUPABASE_DB_URL non définie${NC}"
  echo ""
  echo "Pour effectuer un backup, vous avez plusieurs options :"
  echo ""
  echo "1. Via l'interface Supabase (RECOMMANDÉ) :"
  echo "   - Aller sur https://app.supabase.com"
  echo "   - Sélectionner votre projet"
  echo "   - Database > Backups"
  echo "   - Créer un backup manuel"
  echo ""
  echo "2. Via la CLI Supabase :"
  echo "   npm install -g supabase"
  echo "   supabase db dump -f backup.sql"
  echo ""
  echo "3. Via pg_dump (nécessite PostgreSQL installé) :"
  echo "   pg_dump -Fc --no-acl --no-owner -h <host> -U <user> <database> > backup.dump"
  echo ""
  exit 1
fi

# Instructions pour le backup
echo -e "${BLUE}📋 INSTRUCTIONS DE BACKUP${NC}"
echo ""
echo "Pour sauvegarder votre base de données Supabase :"
echo ""
echo "Option 1 - Via l'interface Supabase (RECOMMANDÉ) :"
echo "  1. Connectez-vous à https://app.supabase.com"
echo "  2. Sélectionnez votre projet"
echo "  3. Allez dans Database > Backups"
echo "  4. Cliquez sur 'Start a backup'"
echo "  5. Attendez la fin du backup"
echo ""
echo "Option 2 - Via la CLI Supabase :"
echo "  supabase db dump -f ${BACKUP_FILE}"
echo ""
echo "Option 3 - Export des données via SQL :"
echo "  - Copiez le contenu du fichier export-data.sql"
echo "  - Exécutez-le dans le SQL Editor de Supabase"
echo "  - Sauvegardez le résultat"
echo ""

# Créer un script SQL d'export simple
cat > "${BACKUP_DIR}/export-data.sql" << 'EOF'
-- Script d'export des données importantes
-- À exécuter dans le SQL Editor de Supabase

-- Export des résultats de quiz
COPY (SELECT * FROM quiz_results) TO STDOUT WITH CSV HEADER;

-- Export des résultats de questionnaires
COPY (SELECT * FROM questionnaire_results) TO STDOUT WITH CSV HEADER;

-- Export des profils (sans données sensibles)
COPY (
  SELECT id, username, zodiac_sign, created_at, updated_at
  FROM astra_profiles
) TO STDOUT WITH CSV HEADER;

-- Note: Adaptez les colonnes selon vos besoins
EOF

echo -e "${GREEN}✅ Script d'export SQL créé : ${BACKUP_DIR}/export-data.sql${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo "  - Le backup est ESSENTIEL avant tout reset"
echo "  - Conservez plusieurs copies du backup"
echo "  - Testez la restauration du backup"
echo "  - Ne supprimez pas les anciens backups immédiatement"
echo ""
echo -e "${BLUE}📦 Emplacement des backups : ${BACKUP_DIR}${NC}"
echo ""

# Vérifier si des backups existent
BACKUP_COUNT=$(ls -1 "${BACKUP_DIR}"/*.sql 2>/dev/null | wc -l)
if [ "$BACKUP_COUNT" -gt 0 ]; then
  echo -e "${GREEN}✅ ${BACKUP_COUNT} backup(s) existant(s) trouvé(s)${NC}"
  ls -lh "${BACKUP_DIR}"/*.sql 2>/dev/null || true
else
  echo -e "${YELLOW}⚠️  Aucun backup existant trouvé${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""
