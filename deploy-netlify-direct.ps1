# Script de déploiement direct sur Netlify (sans rebuild)
# Ce script déploie le dossier dist existant

Write-Host "🚀 Déploiement direct sur Netlify" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le dossier project
if (-not (Test-Path "dist")) {
    Write-Host "❌ Erreur : Dossier dist introuvable" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le dossier 'project' et que le build existe" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Dossier dist trouvé" -ForegroundColor Green
Write-Host ""

# Déployer directement le dossier dist
Write-Host "📤 Déploiement en cours..." -ForegroundColor Cyan
netlify deploy --prod --dir=dist

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Déploiement réussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANT :" -ForegroundColor Yellow
    Write-Host "   N'oubliez pas de configurer les variables d'environnement dans Netlify" -ForegroundColor Yellow
    Write-Host "   Consultez NETLIFY_ENV_VARS.md pour la liste complète" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "❌ Erreur lors du déploiement" -ForegroundColor Red
    Write-Host "   Vérifiez les erreurs ci-dessus" -ForegroundColor Yellow
}


