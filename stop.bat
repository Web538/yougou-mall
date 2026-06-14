@echo off
chcp 65001 >nul 2>&1
title YouGou Mall - Stop Server
cd /d "%~dp0"
cls

echo.
echo ========================================================
echo        YouGou Mall - Stop Server
echo ========================================================
echo.

set "TARGET_PORT=3000"
set "STOPPED_COUNT=0"

echo [INFO] Searching for processes on port %TARGET_PORT%...
echo.

for /f "tokens=5" %%P in ('netstat -ano ^| findstr /r /c:":%TARGET_PORT%.*LISTENING"') do (
    echo [INFO] Stopping process PID=%%P
    taskkill /f /pid %%P >nul 2>&1
    if not errorlevel 1 (
        set /a STOPPED_COUNT+=1
        echo [OK] Stopped PID %%P
    ) else (
        echo [FAIL] Could not stop PID %%P
    )
)

if %STOPPED_COUNT%==0 (
    echo.
    echo [INFO] No process listening on port %TARGET_PORT%
) else (
    echo.
    echo [INFO] Verifying port release...
    timeout /t 2 /nobreak >nul
    netstat -ano | findstr /r /c:":%TARGET_PORT%.*LISTENING" >nul 2>&1
    if errorlevel 1 (
        echo [OK] Port %TARGET_PORT% released successfully
    ) else (
        echo [WARN] Port %TARGET_PORT% still in use, trying to stop all Node processes...
        tasklist | findstr /i "node.exe" >nul 2>&1
        if not errorlevel 1 (
            taskkill /f /im node.exe >nul 2>&1
            echo [OK] All node.exe processes stopped
        ) else (
            echo [ERROR] Cannot release port. Please check manually.
        )
    )
)

echo.
echo ========================================================
echo   Project Dir:   %~dp0
echo   Target Port:   %TARGET_PORT%
echo   Stopped:       %STOPPED_COUNT% process(es)
echo ========================================================
echo.
echo Press any key to exit...
pause >nul
exit /b 0
