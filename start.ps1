# ============================================================
#  优购商城 - 一键启动脚本
# ============================================================

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPort = 8080
$ServerHost = '127.0.0.1'
$url = "http://$ServerHost`:$ServerPort/"
$LogDir = Join-Path $ProjectRoot 'logs'
$LogFile = Join-Path $LogDir "server.log"
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         优购商城电商平台 - 本地启动" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] 项目目录: $ProjectRoot"
Write-Host "[INFO] 服务端口: $ServerPort"
Write-Host ""

# 检查文件
$requiredFiles = @('index.html', 'styles.css', 'app.js')
$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path (Join-Path $ProjectRoot $file))) { $missingFiles += $file }
}
if ($missingFiles.Count -gt 0) {
    Write-Host "[ERROR] 缺少以下必要文件:" -ForegroundColor Red
    $missingFiles | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Read-Host "按回车键退出"
    exit 1
}
Write-Host "[OK] 项目文件检查通过" -ForegroundColor Green

# 释放占用端口
try {
    $portInUse = Get-NetTCPConnection -LocalPort $ServerPort -ErrorAction SilentlyContinue
    if ($portInUse) {
        Write-Host "[WARN] 端口 $ServerPort 已被占用，尝试释放..." -ForegroundColor Yellow
        foreach ($p in $portInUse) {
            try {
                $proc = Get-Process -Id $p.OwningProcess -ErrorAction SilentlyContinue
                if ($proc -and ($proc.ProcessName -match 'python|node|httpd')) {
                    Stop-Process -Id $p.OwningProcess -Force -ErrorAction SilentlyContinue
                }
            } catch { }
        }
        Start-Sleep -Seconds 1
    }
} catch { }

# 检测可用的 HTTP 服务器
$pythonExe = $null
foreach ($cmd in @('python', 'python3', 'py')) {
    try { $null = & $cmd --version 2>&1; $pythonExe = $cmd; break } catch { }
}

Set-Location $ProjectRoot
$serverProcess = $null

if ($pythonExe) {
    Write-Host "[OK] 使用 Python HTTP 服务器 ($pythonExe)" -ForegroundColor Green
    "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] 启动 Python HTTP 服务器 - 端口 $ServerPort" | Out-File -FilePath $LogFile -Encoding UTF8
    $serverProcess = Start-Process -FilePath $pythonExe `
        -ArgumentList @('-m', 'http.server', $ServerPort, '--bind', $ServerHost) `
        -WorkingDirectory $ProjectRoot `
        -RedirectStandardOutput $LogFile `
        -RedirectStandardError (Join-Path $LogDir "error.log") `
        -PassThru -NoNewWindow
} else {
    Write-Host "[ERROR] 未检测到 Python，请先安装 Python: https://www.python.org/downloads/" -ForegroundColor Red
    Write-Host ""
    Write-Host "安装后可在命令行运行: python --version  确认安装成功"
    Write-Host ""
    Read-Host "按回车键退出"
    exit 1
}

# 等待服务器就绪
Start-Sleep -Seconds 2
$serverReady = $false
for ($i = 0; $i -lt 10; $i++) {
    try {
        $request = [System.Net.WebRequest]::Create($url)
        $response = $request.GetResponse()
        if ($response.StatusCode -eq 200) { $serverReady = $true; $response.Close(); break }
    } catch { }
    Start-Sleep -Milliseconds 500
}

if ($serverReady) {
    Write-Host "[OK] 服务器启动成功!" -ForegroundColor Green
} else {
    Write-Host "[WARN] 服务器启动较慢，仍尝试打开浏览器..." -ForegroundColor Yellow
}

# 自动打开浏览器
Write-Host "[INFO] 正在打开浏览器: $url" -ForegroundColor Cyan
try { Start-Process $url } catch { Write-Host "[WARN] 请手动在浏览器中打开: $url" -ForegroundColor Yellow }

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  🌐 访问地址: $url" -ForegroundColor Green
Write-Host "  📂 项目目录: $ProjectRoot"
Write-Host "  📝 日志文件: $LogFile"
Write-Host "  🔧 服务器进程 PID: $($serverProcess.Id)"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  操作命令:"
Write-Host "    s - 查看服务器状态"
Write-Host "    l - 查看最近日志"
Write-Host "    r - 重启服务器"
Write-Host "    o - 重新打开浏览器"
Write-Host "    q - 停止服务器并退出"
Write-Host ""

$running = $true
while ($running) {
    $input = Read-Host "请输入命令 (回车查看状态)"
    switch ($input) {
        'q' {
            Write-Host "[INFO] 正在停止服务器..." -ForegroundColor Cyan
            try { if ($serverProcess -and (-not $serverProcess.HasExited)) { Stop-Process -Id $serverProcess.Id -Force } } catch { }
            "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] 用户停止服务器" | Out-File -FilePath $LogFile -Append -Encoding UTF8
            $running = $false
        }
        'r' {
            Write-Host "[INFO] 正在重启服务器..." -ForegroundColor Cyan
            try { if ($serverProcess -and (-not $serverProcess.HasExited)) { Stop-Process -Id $serverProcess.Id -Force; Start-Sleep -Seconds 2 } } catch { }
            $serverProcess = Start-Process -FilePath $pythonExe `
                -ArgumentList @('-m', 'http.server', $ServerPort, '--bind', $ServerHost) `
                -WorkingDirectory $ProjectRoot -PassThru -NoNewWindow
            Start-Sleep -Seconds 2
            Write-Host "[OK] 服务器已重启 (PID: $($serverProcess.Id))" -ForegroundColor Green
            try { Start-Process $url } catch { }
        }
        'o' { try { Start-Process $url } catch { Write-Host "[WARN] 无法打开浏览器" -ForegroundColor Yellow } }
        'l' {
            if (Test-Path $LogFile) {
                Write-Host ""; Write-Host "--- 最近日志 ---" -ForegroundColor Cyan
                Get-Content $LogFile -Tail 20 | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
                Write-Host "--- 结束 ---" -ForegroundColor Cyan; Write-Host ""
            } else { Write-Host "[INFO] 暂无日志" -ForegroundColor Yellow }
        }
        default {
            if ($serverProcess -and (-not $serverProcess.HasExited)) {
                $uptime = (Get-Date) - $serverProcess.StartTime
                Write-Host ""
                Write-Host "  服务器状态: 运行中 ✅" -ForegroundColor Green
                Write-Host "  进程 PID: $($serverProcess.Id)"
                Write-Host "  运行时长: $($uptime.Hours)小时 $($uptime.Minutes)分钟 $($uptime.Seconds)秒"
                Write-Host "  访问地址: $url"
                Write-Host ""
            } else { Write-Host "[WARN] 服务器进程已停止" -ForegroundColor Red }
        }
    }
}

Write-Host ""; Write-Host "[INFO] 程序已退出，感谢使用！" -ForegroundColor Cyan
Start-Sleep -Seconds 1
