# Spirit OS - Automated Staged Push Runner
# Enforces >= 15 minute delay between pushes
# Stops after Push 10

$ErrorActionPreference = "Continue"
$src = "D:\codes\Spirit_OS\Spirit_OS-main"
$dst = "D:\codes\wisperflow"
$logFile = "$dst\push_progress.log"

function Log-Message($msg) {
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    $line = "[$timestamp] $msg"
    Write-Host $line
    Add-Content -Path $logFile -Value $line
}

Log-Message "=== Push Runner Active (Core Pillars Focus) ==="

$steps = @(
    @{
        Step = 2
        Name = "docs: add Spirit OS architecture documentation and core specifications"
        Action = {
            Copy-Item "$src\README.md" "$dst\README.md" -Force
            if (Test-Path "$src\docs") {
                Copy-Item "$src\docs" "$dst\docs" -Recurse -Force
            }
        }
    },
    @{
        Step = 3
        Name = "feat(server): setup Node.js Express server and environment configuration"
        Action = {
            if (-not (Test-Path "$dst\server")) { New-Item -ItemType Directory -Path "$dst\server" -Force | Out-Null }
            Copy-Item "$src\server\package.json" "$dst\server\package.json" -Force
            Copy-Item "$src\server\.env.example" "$dst\server\.env.example" -Force
        }
    },
    @{
        Step = 4
        Name = "feat(server): configure PostgreSQL and Prisma database persistence"
        Action = {
            if (-not (Test-Path "$dst\server\lib")) { New-Item -ItemType Directory -Path "$dst\server\lib" -Force | Out-Null }
            Copy-Item "$src\server\prisma" "$dst\server\prisma" -Recurse -Force
            Copy-Item "$src\server\lib\prisma.js" "$dst\server\lib\prisma.js" -Force
        }
    },
    @{
        Step = 5
        Name = "feat(server): implement Express core runtime, session auth and WebSocket gateway"
        Action = {
            Copy-Item "$src\server\index.js" "$dst\server\index.js" -Force
            Copy-Item "$src\server\middleware" "$dst\server\middleware" -Recurse -Force
            Copy-Item "$src\server\ws.js" "$dst\server\ws.js" -Force
        }
    },
    @{
        Step = 6
        Name = "feat(client): bootstrap React Vite client with Tailwind CSS and desktop themes"
        Action = {
            if (-not (Test-Path "$dst\client\src")) { New-Item -ItemType Directory -Path "$dst\client\src" -Force | Out-Null }
            Get-ChildItem "$src\client" -File | ForEach-Object {
                Copy-Item $_.FullName "$dst\client\$($_.Name)" -Force
            }
            Copy-Item "$src\client\src\index.css" "$dst\client\src\index.css" -Force
            Copy-Item "$src\client\src\main.jsx" "$dst\client\src\main.jsx" -Force
            Copy-Item "$src\client\src\App.jsx" "$dst\client\src\App.jsx" -Force
        }
    },
    @{
        Step = 7
        Name = "feat(client): implement OS state engine and window management with Zustand"
        Action = {
            if (-not (Test-Path "$dst\client\src\store")) { New-Item -ItemType Directory -Path "$dst\client\src\store" -Force | Out-Null }
            if (-not (Test-Path "$dst\client\src\config")) { New-Item -ItemType Directory -Path "$dst\client\src\config" -Force | Out-Null }
            if (-not (Test-Path "$dst\client\src\utils")) { New-Item -ItemType Directory -Path "$dst\client\src\utils" -Force | Out-Null }
            Copy-Item "$src\client\src\store\osStore.js" "$dst\client\src\store\osStore.js" -Force
            Copy-Item "$src\client\src\store\windowStore.js" "$dst\client\src\store\windowStore.js" -Force
            Copy-Item "$src\client\src\config\appConfig.js" "$dst\client\src\config\appConfig.js" -Force
            Copy-Item "$src\client\src\utils\terminalLogger.js" "$dst\client\src\utils\terminalLogger.js" -Force
        }
    },
    @{
        Step = 8
        Name = "feat(client): build draggable window subsystem and desktop canvas layout"
        Action = {
            if (-not (Test-Path "$dst\client\src\desktop")) { New-Item -ItemType Directory -Path "$dst\client\src\desktop" -Force | Out-Null }
            if (-not (Test-Path "$dst\client\src\hooks")) { New-Item -ItemType Directory -Path "$dst\client\src\hooks" -Force | Out-Null }
            Copy-Item "$src\client\src\desktop\WindowFrame.jsx" "$dst\client\src\desktop\WindowFrame.jsx" -Force
            Copy-Item "$src\client\src\desktop\Desktop.jsx" "$dst\client\src\desktop\Desktop.jsx" -Force
            Copy-Item "$src\client\src\hooks\useSystemInfo.js" "$dst\client\src\hooks\useSystemInfo.js" -Force
            Copy-Item "$src\client\src\hooks\useWindowShortcuts.js" "$dst\client\src\hooks\useWindowShortcuts.js" -Force
        }
    },
    @{
        Step = 9
        Name = "feat(client): implement animated taskbar, application launcher, and quick settings"
        Action = {
            Copy-Item "$src\client\src\desktop\Taskbar.jsx" "$dst\client\src\desktop\Taskbar.jsx" -Force
            Copy-Item "$src\client\src\desktop\AppLauncher.jsx" "$dst\client\src\desktop\AppLauncher.jsx" -Force
            Copy-Item "$src\client\src\desktop\QuickSettings.jsx" "$dst\client\src\desktop\QuickSettings.jsx" -Force
        }
    },
    @{
        Step = 10
        Name = "feat(client): add interactive desktop icons, context menu, and accessibility feature bar"
        Action = {
            Copy-Item "$src\client\src\desktop\DesktopIcon.jsx" "$dst\client\src\desktop\DesktopIcon.jsx" -Force
            Copy-Item "$src\client\src\desktop\ContextMenu.jsx" "$dst\client\src\desktop\ContextMenu.jsx" -Force
            Copy-Item "$src\client\src\desktop\FeatureBar.jsx" "$dst\client\src\desktop\FeatureBar.jsx" -Force
        }
    }
)

# Target for Push 2: 14:52:00 (15m 40s after Push 1)
$now = Get-Date
$targetPush2 = [DateTime]::Parse("2026-10-08 14:52:00")
$initialWaitSeconds = [Math]::Max(30, [int]($targetPush2 - $now).TotalSeconds)

$delayBetweenSteps = 915 # 15 min 15 sec

$isFirst = $true
foreach ($item in $steps) {
    if ($isFirst) {
        $waitSec = $initialWaitSeconds
        $isFirst = $false
    } else {
        $waitSec = $delayBetweenSteps
    }

    Log-Message "Waiting before executing Push $($item.Step)/10..."
    Log-Message "Sleep for $waitSec seconds ($([Math]::Round($waitSec / 60, 1)) minutes)..."
    Start-Sleep -Seconds $waitSec

    Log-Message "Executing Push $($item.Step)/10: $($item.Name)"
    
    # Run the file copy action
    & $item.Action

    # Stage and commit in git
    Set-Location $dst
    $nowIso = (Get-Date).ToString("yyyy-MM-ddTHH:mm:sszzz")
    $env:GIT_AUTHOR_DATE = $nowIso
    $env:GIT_COMMITTER_DATE = $nowIso

    git add -A
    $status = git status --porcelain
    if ($status) {
        git commit -m "$($item.Name)"
        $pushOut = git push origin main 2>&1
        Log-Message "Push $($item.Step) result: $pushOut"
    } else {
        Log-Message "Warning: No changes detected for Push $($item.Step)"
    }
}

Log-Message "=== Finished 10 Pushes! Halting as requested. ==="
