# Script de deploiement automatique pour Netlify
# Usage: .\deploy.ps1

param(
    [switch]$Preview = $false,
    [switch]$SkipBuild = $false
)

$ErrorActionPreference = "Stop"

Write-Host "Script de Deploiement Netlify - astraloves.com" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que nous sommes dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "ERREUR : package.json introuvable" -ForegroundColor Red
    Write-Host "   Assurez-vous d'etre dans le dossier racine du projet" -ForegroundColor Yellow
    exit 1
}

# Verifier Node.js
Write-Host "Verification de Node.js..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version
    Write-Host "OK - Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERREUR : Node.js n'est pas installe" -ForegroundColor Red
    Write-Host "   Telechargez Node.js depuis https://nodejs.org" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Etape 1: Installation des dependances
Write-Host "Installation des dependances npm..." -ForegroundColor Cyan
if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors de l'installation des dependances" -ForegroundColor Red
        exit 1
    }
    Write-Host "OK - Dependances installees" -ForegroundColor Green
} else {
    Write-Host "OK - Dependances deja installees" -ForegroundColor Green
}
Write-Host ""

# Etape 2: Build de production
if (-not $SkipBuild) {
    Write-Host "Creation du build de production..." -ForegroundColor Cyan
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors du build" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Path "dist")) {
        Write-Host "ERREUR : Le dossier dist n'a pas ete cree" -ForegroundColor Red
        exit 1
    }
    
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "OK - Build reussi ! Taille: $([math]::Round($distSize, 2)) MB" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Build ignore (--SkipBuild)" -ForegroundColor Yellow
    Write-Host ""
}

# Etape 3: Verifier Netlify CLI
Write-Host "Verification de Netlify CLI..." -ForegroundColor Cyan
$netlifyInstalled = $false
try {
    $netlifyVersion = netlify --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        $netlifyInstalled = $true
        Write-Host "OK - Netlify CLI deja installe" -ForegroundColor Green
    }
} catch {
    $netlifyInstalled = $false
}

if (-not $netlifyInstalled) {
    Write-Host "Installation de Netlify CLI..." -ForegroundColor Cyan
    npm install -g netlify-cli
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors de l'installation de Netlify CLI" -ForegroundColor Red
        Write-Host "   Essayez manuellement: npm install -g netlify-cli" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "OK - Netlify CLI installe" -ForegroundColor Green
}
Write-Host ""

# Etape 4: Verifier la connexion Netlify
Write-Host "Verification de la connexion Netlify..." -ForegroundColor Cyan
try {
    $netlifyStatus = netlify status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ATTENTION - Non connecte a Netlify, connexion requise..." -ForegroundColor Yellow
        Write-Host "   Une fenetre de navigateur va s'ouvrir pour vous connecter" -ForegroundColor Cyan
        netlify login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERREUR lors de la connexion a Netlify" -ForegroundColor Red
            exit 1
        }
        Write-Host "OK - Connecte a Netlify" -ForegroundColor Green
    } else {
        Write-Host "OK - Deja connecte a Netlify" -ForegroundColor Green
    }
} catch {
    Write-Host "ATTENTION - Connexion requise..." -ForegroundColor Yellow
    netlify login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR lors de la connexion a Netlify" -ForegroundColor Red
        exit 1
    }
}
Write-Host ""

# Etape 5: Deploiement
Write-Host "Deploiement sur Netlify..." -ForegroundColor Cyan
if ($Preview) {
    Write-Host "   Mode: Preview (deploiement de test)" -ForegroundColor Yellow
    netlify deploy --dir=dist
} else {
    Write-Host "   Mode: Production (deploiement final)" -ForegroundColor Green
    Write-Host "   ATTENTION - Ceci va deployer sur https://astraloves.com" -ForegroundColor Yellow
    $confirm = Read-Host "   Continuer ? (O/N)"
    if ($confirm -ne "O" -and $confirm -ne "o" -and $confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Deploiement annule" -ForegroundColor Yellow
        exit 0
    }
    netlify deploy --prod --dir=dist
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "OK - Deploiement reussi !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Votre site est maintenant en ligne sur:" -ForegroundColor Cyan
    Write-Host "   https://astraloves.com" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "ERREUR lors du deploiement" -ForegroundColor Red
    Write-Host "   Verifiez les logs ci-dessus pour plus de details" -ForegroundColor Yellow
    exit 1
}

Write-Host "Deploiement termine avec succes !" -ForegroundColor Green
