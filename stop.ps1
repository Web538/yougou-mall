# ============================================================
#  优购商城 - 一键停止脚本
#  功能: 停止监听端口 3000 的 Node.js 服务器
# ============================================================

$ErrorActionPreference = 'Continue'
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ServerPort = 3000
$LogDir = Join-Path $ProjectRoot 'logs'
$LogFile = Join-Path $LogDir "stop.log"

# 创建日志目录
New-Item -ItemType Directory -Path $LogDir -Force | Out-Null

function Write-Log {
    param([string]$Msg)
    $timestamp = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'
    "[$timestamp] $Msg" | Out-File -FilePath $LogFile -Append -Encoding UTF8
}

# ============ 开始 ============
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "         优购商城电商平台 - 停止服务器" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Log "=== 开始执行停止脚本 ==="
Write-Log "项目目录: $ProjectRoot"
Write-Log "目标端口: $ServerPort"

Write-Host "[INFO] 项目目录: $ProjectRoot"
Write-Host "[INFO] 目标端口: $ServerPort"
Write-Host ""

# ============ 查找端口占用 ============
Write-Host "[INFO] 正在查询端口 $ServerPort 的占用信息..." -ForegroundColor Cyan
Write-Log "查询端口 $ServerPort 占用..."

try {
    $conns = Get-NetTCPConnection -LocalPort $ServerPort -State Listen -ErrorAction SilentlyContinue
} catch {
    $conns = $null
}

$pidsToKill = @()

if ($null -ne $conns -and $conns.Count -gt 0) {
    foreach ($conn in $conns) {
        try {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($proc) {
                $pidsToKill += [pscustomobject]@{
                    PID    = $conn.OwningProcess
                    Name   = $proc.ProcessName
                    Start  = $proc.StartTime
                }
                Write-Host "  发现: PID=$($conn.OwningProcess), 进程=$($proc.ProcessName), 启动时间=$($proc.StartTime)"
                Write-Log "发现占用: PID=$($conn.OwningProcess), 进程=$($proc.ProcessName)"
            } else {
                $pidsToKill += [pscustomobject]@{
                    PID    = $conn.OwningProcess
                    Name   = "Unknown"
                    Start  = "Unknown"
                }
                Write-Host "  发现: PID=$($conn.OwningProcess), 进程=未知"
                Write-Log "发现占用: PID=$($conn.OwningProcess), 进程=未知"
            }
        } catch {
            Write-Host "  [WARN] 无法获取进程信息 (PID: $($conn.OwningProcess))" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "[OK] 端口 $ServerPort 无监听，无需停止" -ForegroundColor Green
    Write-Log "端口 $ServerPort 无监听"
}

# ============ 额外扫描 Node.js 进程 ============
Write-Host ""
Write-Host "[INFO] 扫描正在运行的 Node.js 进程..." -ForegroundColor Cyan

try {
    $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
    if ($null -ne $nodeProcs -and $nodeProcs.Count -gt 0) {
        foreach ($np in $nodeProcs) {
            $exists = $false
            foreach ($k in $pidsToKill) {
                if ($k.PID -eq $np.Id) { $exists = $true; break }
            }
            if (-not $exists) {
                $pidsToKill += [pscustomobject]@{
                    PID    = $np.Id
                    Name   = $np.ProcessName
                    Start  = $np.StartTime
                }
                Write-Host "  发现: PID=$($np.Id), 进程=$($np.ProcessName) (未在端口 $ServerPort 监听)"
                Write-Log "发现 Node 进程: PID=$($np.Id)"
            }
        }
    } else {
        Write-Host "  未发现额外的 Node.js 进程"
    }
} catch {
    Write-Host "  [WARN] 扫描 Node.js 进程时出错: $_" -ForegroundColor Yellow
}

# ============ 终止进程 ============
Write-Host ""
if ($pidsToKill.Count -eq 0) {
    Write-Host "[INFO] 没有需要停止的进程" -ForegroundColor Green
} else {
    Write-Host "[INFO] 开始终止 $($pidsToKill.Count) 个进程..." -ForegroundColor Cyan
    $successCount = 0
    foreach ($target in $pidsToKill) {
        try {
            Stop-Process -Id $target.PID -Force -ErrorAction Stop
            Write-Host "  [OK] 已终止 PID=$($target.PID) ($($target.Name))" -ForegroundColor Green
            Write-Log "已终止: PID=$($target.PID), 进程=$($target.Name)"
            $successCount++
        } catch {
            try {
                # 备用方法: 使用 taskkill
                & taskkill /f /pid $target.PID > $null 2>&1
                Write-Host "  [OK] 已终止 PID=$($target.PID) (通过 taskkill)" -ForegroundColor Green
                Write-Log "已终止(通过 taskkill): PID=$($target.PID)"
                $successCount++
            } catch {
                Write-Host "  [FAIL] 无法终止 PID=$($target.PID): $_" -ForegroundColor Red
                Write-Log "终止失败: PID=$($target.PID), 错误=$_"
            }
        }
    }
    Write-Host ""
    Write-Host "[INFO] 成功终止 $successCount / $($pidsToKill.Count) 个进程"

    # ============ 验证端口释放 ============
    Write-Host ""
    Write-Host "[INFO] 正在验证端口 $ServerPort 是否释放..." -ForegroundColor Cyan
    Start-Sleep -Seconds 2

    try {
        $verify = Get-NetTCPConnection -LocalPort $ServerPort -State Listen -ErrorAction SilentlyContinue
    } catch {
        $verify = $null
    }

    if ($null -eq $verify -or $verify.Count -eq 0) {
        Write-Host "[OK] 端口 $ServerPort 已成功释放 ✅" -ForegroundColor Green
        Write-Log "端口 $ServerPort 已释放"
    } else {
        Write-Host "[WARN] 端口 $ServerPort 仍被占用，尝试强制方式..." -ForegroundColor Yellow
        # 兜底: 终止所有 node.exe
        try {
            Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
            Start-Sleep -Seconds 1
            $verify2 = Get-NetTCPConnection -LocalPort $ServerPort -State Listen -ErrorAction SilentlyContinue
            if ($null -eq $verify2 -or $verify2.Count -eq 0) {
                Write-Host "[OK] 已释放端口 $ServerPort" -ForegroundColor Green
            } else {
                Write-Host "[ERROR] 仍无法释放端口，请手动检查" -ForegroundColor Red
                Write-Log "仍无法释放端口 $ServerPort"
            }
        } catch {
            Write-Host "[ERROR] 释放失败: $_" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  📂 项目目录: $ProjectRoot"
Write-Host "  🔌 目标端口: $ServerPort"
Write-Host "  📝 日志文件: $LogFile"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Log "=== 停止脚本执行完毕 ==="

Write-Host "按回车键退出..."
Read-Host
