@echo off
chcp 65001 >nul
title YouGou Mall - Local Server
cd /d "%~dp0"
cls
echo.
echo ========================================================
echo     YouGou Mall - Local Development Server
echo ========================================================
echo.
echo [INFO] Project: %~dp0
echo [INFO] Port:    8080
echo [INFO] URL:     http://127.0.0.1:8080/
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo         Please install Python from:
    echo         https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)
echo [OK] Python detected

REM Check required files
if not exist index.html (
    echo [ERROR] index.html not found
    pause
    exit /b 1
)
if not exist styles.css (
    echo [ERROR] styles.css not found
    pause
    exit /b 1
)
if not exist app.js (
    echo [ERROR] app.js not found
    pause
    exit /b 1
)
echo [OK] Project files verified

REM Kill any process using port 8080
for /f "tokens=5" %%P in ('netstat -ano 2^>nul ^| findstr :8080 ^| findstr LISTENING') do (
    echo [WARN] Port 8080 in use (PID: %%P), releasing...
    taskkill /F /PID %%P >nul 2>&1
    timeout /t 2 /nobreak >nul
)

REM Start HTTP server
echo [INFO] Starting HTTP server...
start "YouGou Mall Server" cmd /k "cd /d %~dp0 && python -m http.server 8080 --bind 127.0.0.1"

REM Wait for server to be ready
timeout /t 3 /nobreak >nul

REM Open browser
echo [INFO] Opening browser...
start "" "http://127.0.0.1:8080/"

echo.
echo ========================================================
echo   URL:    http://127.0.0.1:8080/
echo   Folder: %~dp0
echo.
echo   Notes:
echo   - Do NOT close the other command window (HTTP server)
echo   - If browser does not open, visit the URL manually
echo   - Close the server window to stop HTTP service
echo ========================================================
echo.
echo Server is running. Press any key to close this message.
echo (Server will continue running in other window)
pause >nul