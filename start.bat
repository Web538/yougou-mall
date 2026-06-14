@echo off
chcp 65001 >nul 2>&1
title YouGou Mall - Server
cd /d "%~dp0"
cls

echo.
echo ========================================================
echo        YouGou Mall - E-commerce Platform
echo        Local Development Server
echo ========================================================
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install from:
    echo         https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js installed:
node --version

REM Check npm dependencies
if not exist "node_modules" (
    echo [INFO] Installing npm dependencies...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install failed
        pause
        exit /b 1
    )
    echo [OK] Dependencies installed
)

echo.
echo [INFO] Starting backend server on port 3000...
echo [INFO] Access: http://localhost:3000/
echo.

REM Start Node.js server in new window
start "YouGou Mall Server" cmd /k "cd /d "%~dp0" && node server/index.js"

REM Wait for server startup
timeout /t 3 /nobreak >nul

REM Open browser
echo [INFO] Opening browser...
start "" "http://localhost:3000/"

echo.
echo ========================================================
echo   API Service:   http://localhost:3000/api
echo   Frontend:      http://localhost:3000/
echo   Project Dir:   %~dp0
echo.
echo   Tips:
echo   - Do NOT close the server window
echo   - Close the server window to stop the service
echo ========================================================
echo.
echo Press any key to close this window (server keeps running)...
pause >nul
