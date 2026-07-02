@echo off
cd /d "%~dp0"
title YarnMarket Startup Script
echo ====================================================
echo             STARTING YARNBAZAAR SERVICES
echo ====================================================
echo.

echo [1/1] Starting backend on http://localhost:5000 ...
start cmd /k "cd backend && npm start"

echo.
echo ====================================================
echo  Service is launching in a background window.
echo  - Platform:    http://localhost:5000
echo ====================================================
echo.
pause
