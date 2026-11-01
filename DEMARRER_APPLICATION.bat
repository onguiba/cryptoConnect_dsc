@echo off
title CryptoConnect - Serveur
color 0A

echo.
echo ========================================================================
echo              CRYPTOCONNECT PRO - DEMARRAGE DU SERVEUR
echo ========================================================================
echo.

echo [1/4] Verification de Node.js...
node --version > nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERREUR] Node.js n'est pas installe!
    echo.
    echo Telechargez Node.js sur: https://nodejs.org/
    echo.
    pause
    exit /b 1
)
node --version
echo [OK] Node.js detecte
echo.

echo [2/4] Verification de MongoDB...
mongosh --version > nul 2>&1
if %errorlevel% neq 0 (
    color 0E
    echo [ATTENTION] MongoDB CLI non detecte (mongosh)
    echo.
    echo Options:
    echo   1. Installez MongoDB localement: https://www.mongodb.com/try/download/community
    echo   2. Ou utilisez MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas
    echo.
    echo L'application demarrera quand meme si MongoDB est configure dans .env
    echo.
) else (
    mongosh --version
    echo [OK] MongoDB CLI detecte
)
echo.

echo [3/4] Verification des dependances...
if not exist "node_modules\" (
    echo Installation des dependances en cours...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [ERREUR] Echec de l'installation des dependances
        pause
        exit /b 1
    )
    echo [OK] Dependances installees
) else (
    echo [OK] Dependances deja installees
)
echo.

echo [4/4] Verification du fichier .env...
if not exist ".env" (
    color 0E
    echo [ATTENTION] Fichier .env manquant
    echo Creation d'un fichier .env par defaut...
    copy .env.example .env > nul 2>&1
    echo [OK] Fichier .env cree - Configurez vos variables si necessaire
) else (
    echo [OK] Fichier .env present
)
echo.

echo ========================================================================
echo                     LANCEMENT DE L'APPLICATION
echo ========================================================================
echo.
echo   Application     : CryptoConnect Pro
echo   URL             : http://localhost:3000
echo   Documentation   : Voir README.md
echo.
echo   Compte de test  : kouassi@email.com / Password123
echo.
echo ========================================================================
echo.
echo   [i] Le navigateur va s'ouvrir automatiquement...
echo   [i] Appuyez sur Ctrl+C pour arreter le serveur
echo.
echo ========================================================================
echo.

timeout /t 2 > nul
start http://localhost:3000

call npm run dev

pause
