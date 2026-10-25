@echo off
setlocal enabledelayedexpansion
title Ayon Mondal Portfolio - GitHub Push Helper
color 0b

echo ===================================================================
echo               AYON MONDAL - PORTFOLIO GITHUB PUSH
echo   Target: https://github.com/ayonmondal340/PORTFOLIO-WEBSITE-.git
echo ===================================================================
echo.
cd /d "%~dp0"

echo [1/3] Checking Git Repository Status...
git status
echo.

echo [2/3] How would you like to authenticate to GitHub?
echo   1. Try Browser Login / Git Credential Manager (Default)
echo   2. Enter GitHub Personal Access Token (Recommended if 1 fails)
echo.
set /p authchoice="Enter choice (1 or 2, default is 1): "

if "%authchoice%"=="2" goto with_token

:browser_auth
echo.
echo [3/3] Attempting Git Push to origin main...
echo (If a browser window or popup appears, please click "Authorize" or sign in)
echo.
git push -u origin main
if errorlevel 1 goto token_fallback
goto success

:with_token
echo.
echo To generate a Personal Access Token:
echo   1. Open: https://github.com/settings/tokens/new
echo   2. Note: portfolio, Check 'repo' checkbox, click 'Generate token'
echo.
set /p ghtoken="Paste your GitHub Personal Access Token (starts with ghp_): "
if "%ghtoken%"=="" goto error

echo.
echo [3/3] Pushing to GitHub using Token...
git push -u https://%ghtoken%@github.com/ayonmondal340/PORTFOLIO-WEBSITE-.git main
if errorlevel 1 goto error
goto success

:token_fallback
echo.
echo -------------------------------------------------------------------
echo [!] Browser login was cancelled or failed.
echo Let's use a Personal Access Token instead.
echo -------------------------------------------------------------------
echo 1. Open: https://github.com/settings/tokens/new
echo 2. Give it note "portfolio", check the "repo" box, click "Generate token"
echo 3. Copy the token and paste it below:
echo.
set /p ghtoken="Paste token here: "
if "%ghtoken%"=="" goto error
git push -u https://%ghtoken%@github.com/ayonmondal340/PORTFOLIO-WEBSITE-.git main
if errorlevel 1 goto error
goto success

:success
echo.
echo ===================================================================
echo   SUCCESS! All 316 project files pushed to GitHub successfully!
echo.
echo   Now go to Vercel:
echo   https://vercel.com/new/clone?repository-url=https://github.com/ayonmondal340/PORTFOLIO-WEBSITE-
echo   and click "Deploy". It will build and go live instantly!
echo ===================================================================
goto end

:error
echo.
echo ===================================================================
echo [!] Push failed. Please check your token permissions or network.
echo ===================================================================

:end
echo.
pause
