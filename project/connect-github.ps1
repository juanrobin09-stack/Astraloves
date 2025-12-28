# Script pour connecter le projet à GitHub
# Usage: .\connect-github.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUrl
)

Write-Host "Configuration de la connexion GitHub..." -ForegroundColor Cyan
Write-Host ""

# Verifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "ERREUR : package.json introuvable" -ForegroundColor Red
    Write-Host "   Assurez-vous d'etre dans le dossier project" -ForegroundColor Yellow
    exit 1
}

# Verifier Git
try {
    git --version | Out-Null
} catch {
    Write-Host "ERREUR : Git n'est pas installe" -ForegroundColor Red
    exit 1
}

# Verifier si un remote existe deja
$existingRemote = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "ATTENTION : Un remote existe deja : $existingRemote" -ForegroundColor Yellow
    $confirm = Read-Host "   Voulez-vous le remplacer ? (O/N)"
    if ($confirm -eq "O" -or $confirm -eq "o") {
        git remote remove origin
        Write-Host "   Ancien remote supprime" -ForegroundColor Green
    } else {
        Write-Host "   Operation annulee" -ForegroundColor Yellow
        exit 0
    }
}

# Ajouter le remote
Write-Host "Ajout du remote GitHub..." -ForegroundColor Cyan
git remote add origin $GitHubUrl

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK - Remote ajoute : $GitHubUrl" -ForegroundColor Green
} else {
    Write-Host "ERREUR lors de l'ajout du remote" -ForegroundColor Red
    exit 1
}

# Verifier le remote
Write-Host ""
Write-Host "Verification du remote..." -ForegroundColor Cyan
git remote -v

# Renommer la branche en main
Write-Host ""
Write-Host "Renommage de la branche en main..." -ForegroundColor Cyan
git branch -M main

# Afficher les instructions
Write-Host ""
Write-Host "================================================" -ForegroundColor Green
Write-Host "Configuration terminee avec succes !" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Pousser le code vers GitHub :" -ForegroundColor White
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Dans Netlify :" -ForegroundColor White
Write-Host "   - Allez dans Site settings > Build & deploy" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'Link to Git provider'" -ForegroundColor Gray
Write-Host "   - Choisissez GitHub et selectionnez votre repository" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Configurer les variables d'environnement dans Netlify" -ForegroundColor White
Write-Host ""
Write-Host "Votre projet est maintenant pret pour le deploiement continu !" -ForegroundColor Green


