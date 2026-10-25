@echo off
echo =======================================================
echo   Ayon Mondal Portfolio - GitHub Push Helper
echo   Target: https://github.com/ayonmondal340/PORTFOLIO-WEBSITE-.git
echo =======================================================
echo.
cd /d "%~dp0"

echo 1. Checking Git Status...
git status

echo.
echo 2. Pushing main branch to GitHub...
echo (If prompted, please click 'Sign in with your browser' or enter your GitHub token)
echo.
git push -u origin main

if errorlevel 1 goto error
echo.
echo =======================================================
echo   SUCCESS! All files pushed to GitHub successfully!
echo   You can now import and deploy directly on Vercel:
echo   https://vercel.com/new/clone?repository-url=https://github.com/ayonmondal340/PORTFOLIO-WEBSITE-
echo =======================================================
goto end

:error
echo.
echo [!] Push encountered an error.
echo If GitHub asks for authentication, GitHub requires a Personal Access Token (PAT).
echo 1. Generate a token at: https://github.com/settings/tokens (select 'repo' scope)
echo 2. Then run:
echo    git push https://YOUR_TOKEN@github.com/ayonmondal340/PORTFOLIO-WEBSITE-.git main

:end
echo.
pause
