# Script de Déploiement Netlify pour astraloves.com
# Ce script aide à préparer le projet pour le déploiement

Write-Host "🚀 Script de Préparation au Déploiement Netlify" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur : package.json introuvable" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le dossier 'project'" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Structure du projet vérifiée" -ForegroundColor Green
Write-Host ""

# Vérifier Node.js
Write-Host "📦 Vérification de Node.js..." -ForegroundColor Cyan
$nodeVersion = node --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
    Write-Host "   Téléchargez Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
Write-Host ""

# Vérifier npm
Write-Host "📦 Vérification de npm..." -ForegroundColor Cyan
$npmVersion = npm --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm n'est pas installé" -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
Write-Host ""

# Vérifier les dépendances
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules introuvable, installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} else {
    Write-Host "✅ Dépendances déjà installées" -ForegroundColor Green
}
Write-Host ""

# Vérifier netlify.toml
Write-Host "📄 Vérification de netlify.toml..." -ForegroundColor Cyan
if (Test-Path "netlify.toml") {
    Write-Host "✅ netlify.toml trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  netlify.toml introuvable" -ForegroundColor Yellow
    Write-Host "   Le fichier devrait être créé pour la configuration Netlify" -ForegroundColor Yellow
}
Write-Host ""

# Vérifier les variables d'environnement
Write-Host "🔐 Vérification des variables d'environnement..." -ForegroundColor Cyan
$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green
    Write-Host "   ⚠️  Assurez-vous de configurer les mêmes variables dans Netlify" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  Fichier .env.local introuvable" -ForegroundColor Yellow
    Write-Host "   Créez un fichier .env.local avec vos variables d'environnement" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Variables nécessaires :" -ForegroundColor Cyan
    Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
    Write-Host "   - VITE_SUPABASE_ANON_KEY" -ForegroundColor White
    Write-Host "   - VITE_STRIPE_PUBLIC_KEY (optionnel)" -ForegroundColor White
}
Write-Host ""

# Nettoyer les anciens builds
Write-Host "🧹 Nettoyage des anciens builds..." -ForegroundColor Cyan
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
    Write-Host "✅ Ancien dossier dist supprimé" -ForegroundColor Green
} else {
    Write-Host "✅ Aucun build précédent trouvé" -ForegroundColor Green
}
Write-Host ""

# Demander confirmation pour le build
Write-Host "🔨 Voulez-vous créer un build de production maintenant ?" -ForegroundColor Cyan
$response = Read-Host "   (O/N)"
if ($response -eq "O" -or $response -eq "o" -or $response -eq "Y" -or $response -eq "y") {
    Write-Host ""
    Write-Host "🔨 Création du build de production..." -ForegroundColor Cyan
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build réussi !" -ForegroundColor Green
        Write-Host ""
        
        # Vérifier le dossier dist
        if (Test-Path "dist") {
            $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
            Write-Host "📊 Taille du build: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
            Write-Host ""
            
            # Lister les fichiers principaux
            Write-Host "📁 Fichiers générés :" -ForegroundColor Cyan
            Get-ChildItem -Path "dist" -File | ForEach-Object {
                Write-Host "   - $($_.Name)" -ForegroundColor White
            }
            if (Test-Path "dist/assets") {
                $assetCount = (Get-ChildItem -Path "dist/assets" -File).Count
                Write-Host "   - assets/ ($assetCount fichiers)" -ForegroundColor White
            }
        }
    } else {
        Write-Host ""
        Write-Host "❌ Erreur lors du build" -ForegroundColor Red
        Write-Host "   Vérifiez les erreurs ci-dessus" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "⏭️  Build ignoré" -ForegroundColor Yellow
}
Write-Host ""

# Résumé et prochaines étapes
Write-Host "📋 Prochaines Étapes :" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Vérifier que le build fonctionne localement :" -ForegroundColor White
Write-Host "   npm run preview" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 📤 Pousser le code sur GitHub :" -ForegroundColor White
Write-Host "   git add ." -ForegroundColor Gray
Write-Host "   git commit -m 'Ready for Netlify deployment'" -ForegroundColor Gray
Write-Host "   git push origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 🌐 Créer un site sur Netlify :" -ForegroundColor White
Write-Host "   - Allez sur https://app.netlify.com" -ForegroundColor Gray
Write-Host "   - Importez votre repository GitHub" -ForegroundColor Gray
Write-Host "   - Configurez les variables d'environnement" -ForegroundColor Gray
Write-Host ""
Write-Host "4. 🔗 Configurer le domaine astraloves.com :" -ForegroundColor White
Write-Host "   - Ajoutez le domaine dans Netlify" -ForegroundColor Gray
Write-Host "   - Configurez les DNS dans Name.com" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 Consultez GUIDE_DEPLOIEMENT_NETLIFY.md pour les détails complets" -ForegroundColor Cyan
Write-Host ""
Write-Host "✨ Bon déploiement ! 🚀" -ForegroundColor Green



