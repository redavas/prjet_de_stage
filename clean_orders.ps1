# Script pour supprimer les fichiers liés aux commandes

# Fonction pour supprimer un fichier avec confirmation
function Remove-FileSafely {
    param (
        [string]$Path
    )
    
    if (Test-Path $Path) {
        Write-Host "Suppression de: $Path"
        Remove-Item -Path $Path -Force
    } else {
        Write-Host "Fichier introuvable: $Path"
    }
}

# Nettoyage du Frontend
$frontendFiles = @(
    "frontend\src\components\OrderDetailsPage.js",
    "frontend\src\components\OrderSuccessPage.js",
    "frontend\src\components\OrderSummary.css",
    "frontend\src\components\OrderSummary.js",
    "frontend\src\constants\orderConstants.js",
    "frontend\src\pages\OrderDetails.js",
    "frontend\src\pages\OrderSuccess.js",
    "frontend\src\pages\Orders.js",
    "frontend\src\redux\actions\orderActions.js",
    "frontend\src\redux\constants\orderConstants.js",
    "frontend\src\redux\orderActions.js",
    "frontend\src\redux\orderReducers.js",
    "frontend\src\redux\reducers\orderReducers.js"
)

# Nettoyage du Backend
$backendFiles = @(
    "backend\controllers\orderController.js",
    "backend\models\Order.js",
    "backend\routes\order.js",
    "backend\routes\orderRoutes.js"
)

# Exécution des suppressions
Write-Host "=== Nettoyage des fichiers de commandes ===" -ForegroundColor Cyan

# Suppression des fichiers frontend
Write-Host "`n=== Suppression des fichiers frontend ===" -ForegroundColor Yellow
foreach ($file in $frontendFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    Remove-FileSafely -Path $fullPath
}

# Suppression des fichiers backend
Write-Host "`n=== Suppression des fichiers backend ===" -ForegroundColor Yellow
foreach ($file in $backendFiles) {
    $fullPath = Join-Path $PSScriptRoot $file
    Remove-FileSafely -Path $fullPath
}

Write-Host "`nNettoyage terminé!" -ForegroundColor Green
