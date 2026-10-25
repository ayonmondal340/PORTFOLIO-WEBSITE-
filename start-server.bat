@echo off
title Ayon Mondal Portfolio Server
cd /d "F:\portfolio"
echo ========================================================
echo    Ayon Mondal Portfolio - Cinematic Scroll Experience
echo ========================================================
echo Starting high-performance multi-threaded server...
start /min powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File "F:\portfolio\server.ps1"
timeout /t 2 /nobreak >nul
start http://localhost:3000/
echo.
echo Server active at: http://localhost:3000/
echo (You can close this command window anytime)
timeout /t 4 >nul
exit
