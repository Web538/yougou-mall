@echo off
chcp 65001 >nul
title YouGou Mall - Local Development Server
cd /d "%~dp0"
cls

echo.
echo ========================================================
echo       优购商城电商平台 - 本地开发服务器
echo ========================================================
echo.

REM 检查 Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] 未检测到 Node.js，请先安装:
    echo         https://nodejs.org/
    echo.
    pause
    exit /b 1
)
echo [OK] Node.js 已安装: 
node --version

REM 检查 npm 依赖
if not exist "node_modules" (
    echo [INFO] 正在安装 npm 依赖...
    call npm install
    if errorlevel 1 (
        echo [ERROR] npm install 失败
        pause
        exit /b 1
    )
)

echo.
echo [INFO] 正在启动后端 API 服务器 (端口: 3000)...
echo [INFO] 访问地址: http://localhost:3000/
echo.

REM 启动 Node.js 服务器（后台运行）
start "YouGou Mall Server" cmd /k "node server/index.js"

REM 等待服务器启动
timeout /t 3 /nobreak >nul

REM 打开浏览器
echo [INFO] 正在打开浏览器...
start "" "http://localhost:3000/"

echo.
echo ========================================================
echo   API 服务:   http://localhost:3000/api
echo   前端页面:   http://localhost:3000/
echo   项目目录:   %~dp0
echo.
echo   提示:
echo   - 请勿关闭弹出的命令行窗口
echo   - 关闭命令行窗口即可停止服务器
echo ========================================================
echo.
echo 按任意键关闭此窗口（服务器继续运行）...
pause >nul
