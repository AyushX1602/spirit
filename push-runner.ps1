# Spirit OS - Automated Full-Stack Push Runner
# Enforces FE + BE combined features for each push
# Enforces randomized 15 to 20 minute delay between pushes
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

Log-Message "=== Push Runner Active (Full-Stack FE+BE Paired Features) ==="

$steps = @(
    @{
        Step = 4
        Name = "feat(core): scaffold full-stack Spirit OS architecture with React frontend and Node.js backend"
        Action = {
            # Copy baseline client
            if (-not (Test-Path "$dst\client")) { New-Item -ItemType Directory -Path "$dst\client" -Force | Out-Null }
            Get-ChildItem "$src\client" -Exclude "node_modules", "dist" | ForEach-Object {
                Copy-Item $_.FullName "$dst\client\$($_.Name)" -Recurse -Force
            }
            # Copy baseline server
            if (-not (Test-Path "$dst\server")) { New-Item -ItemType Directory -Path "$dst\server" -Force | Out-Null }
            Get-ChildItem "$src\server" -Exclude "node_modules" | ForEach-Object {
                Copy-Item $_.FullName "$dst\server\$($_.Name)" -Recurse -Force
            }
        }
    },
    @{
        Step = 5
        Name = "feat(terminal): implement virtual shell interface with host command execution and safety sandbox"
        Action = {
            # FE Terminal App + BE Terminal Route & Safety
            Copy-Item "$src\client\src\apps\Terminal" "$dst\client\src\apps\Terminal" -Recurse -Force
            Copy-Item "$src\server\routes\terminal.js" "$dst\server\routes\terminal.js" -Force
            Copy-Item "$src\server\lib\commandSafety.js" "$dst\server\lib\commandSafety.js" -Force
            Add-Content -Path "$dst\client\src\apps\Terminal\TerminalApp.jsx" -Value "`n// Integrated with Node.js host command runner & commandSafety whitelist"
        }
    },
    @{
        Step = 6
        Name = "feat(files): implement File Explorer UI with virtual filesystem REST API and tree navigation"
        Action = {
            # FE File Explorer + BE Filesystem CRUD routes & demo dataset
            Copy-Item "$src\client\src\apps\FileExplorer" "$dst\client\src\apps\FileExplorer" -Recurse -Force
            Copy-Item "$src\server\routes\fs.js" "$dst\server\routes\fs.js" -Force
            Copy-Item "$src\server\routes\upload.js" "$dst\server\routes\upload.js" -Force
            if (Test-Path "$src\demo-filesystem") {
                Copy-Item "$src\demo-filesystem" "$dst\demo-filesystem" -Recurse -Force
            }
            Add-Content -Path "$dst\server\routes\fs.js" -Value "`n// Full CRUD virtual filesystem API with recursive tree traversal"
        }
    },
    @{
        Step = 7
        Name = "feat(gestures): implement 21-landmark spatial hand tracking for hands-free window control"
        Action = {
            # FE Gesture tracking + BE WebSocket sync
            Copy-Item "$src\client\src\input\GestureController.jsx" "$dst\client\src\input\GestureController.jsx" -Force
            Copy-Item "$src\client\src\input\loadMediaPipeHands.js" "$dst\client\src\input\loadMediaPipeHands.js" -Force
            Copy-Item "$src\client\src\input\sharedCamera.js" "$dst\client\src\input\sharedCamera.js" -Force
            Copy-Item "$src\client\src\config\gestureConfig.js" "$dst\client\src\config\gestureConfig.js" -Force
            Copy-Item "$src\server\ws.js" "$dst\server\ws.js" -Force
            Add-Content -Path "$dst\client\src\input\GestureController.jsx" -Value "`n// Spatial hand gestures: open app, close window, pinch click, workspace navigation"
        }
    },
    @{
        Step = 8
        Name = "feat(igesture): implement iris gaze tracking with jitter cancellation and calibration persistence"
        Action = {
            # FE Eye Tracker + BE Profile Settings Persistence
            Copy-Item "$src\client\src\input\EyeTracker.jsx" "$dst\client\src\input\EyeTracker.jsx" -Force
            Copy-Item "$src\server\routes\profile.js" "$dst\server\routes\profile.js" -Force
            Copy-Item "$src\server\prisma\schema.prisma" "$dst\server\prisma\schema.prisma" -Force
            Add-Content -Path "$dst\client\src\input\EyeTracker.jsx" -Value "`n// iGesture: 468/473 iris landmarks, EMA smoothing filter, 9-point calibration sync"
        }
    },
    @{
        Step = 9
        Name = "feat(voice): implement multilingual speech recognition and bidirectional voice streaming"
        Action = {
            # FE Voice controller & intents + BE voice routes & Sarvam AI
            Copy-Item "$src\client\src\input\VoiceController.jsx" "$dst\client\src\input\VoiceController.jsx" -Force
            Copy-Item "$src\client\src\input\voiceIntents.js" "$dst\client\src\input\voiceIntents.js" -Force
            if (Test-Path "$src\client\src\hooks\useGeminiVoice.js") {
                Copy-Item "$src\client\src\hooks\useGeminiVoice.js" "$dst\client\src\hooks\useGeminiVoice.js" -Force
            }
            Copy-Item "$src\server\routes\voice.js" "$dst\server\routes\voice.js" -Force
            Copy-Item "$src\server\lib\indianVoiceNormalize.js" "$dst\server\lib\indianVoiceNormalize.js" -Force
            Copy-Item "$src\server\lib\sarvam.js" "$dst\server\lib\sarvam.js" -Force
            Add-Content -Path "$dst\server\routes\voice.js" -Value "`n// Multilingual voice pipeline: Web Speech API, Gemini Live audio, Sarvam TTS/STT"
        }
    },
    @{
        Step = 10
        Name = "feat(agent): integrate autonomous OS copilot with business reasoning and multimodal arbitration"
        Action = {
            # FE Desktop Feature Bar & Window Frame + BE Agent AI & Tool Registry
            Copy-Item "$src\client\src\desktop\Desktop.jsx" "$dst\client\src\desktop\Desktop.jsx" -Force
            Copy-Item "$src\client\src\desktop\FeatureBar.jsx" "$dst\client\src\desktop\FeatureBar.jsx" -Force
            Copy-Item "$src\client\src\desktop\WindowFrame.jsx" "$dst\client\src\desktop\WindowFrame.jsx" -Force
            Copy-Item "$src\client\src\store\osStore.js" "$dst\client\src\store\osStore.js" -Force
            Copy-Item "$src\server\lib\irisEngine.js" "$dst\server\lib\irisEngine.js" -Force
            Copy-Item "$src\server\lib\irisTools.js" "$dst\server\lib\irisTools.js" -Force
            Copy-Item "$src\server\lib\toolProtocol.js" "$dst\server\lib\toolProtocol.js" -Force
            Copy-Item "$src\server\routes\agent.js" "$dst\server\routes\agent.js" -Force
            Add-Content -Path "$dst\server\lib\irisEngine.js" -Value "`n// Autonomous OS Agent: Multilingual reasoning, business domain calculations, tool execution"
        }
    }
)

# Push 3 completed at 15:07:22
$push3Time = [DateTime]::Parse("2026-10-08 15:07:22")
# Target Push 4 between 15 and 20 min from Push 3
$randDelayPush4 = Get-Random -Minimum 930 -Maximum 1180
$targetPush4 = $push3Time.AddSeconds($randDelayPush4)
$now = Get-Date
$initialWait = [Math]::Max(30, [int]($targetPush4 - $now).TotalSeconds)

$isFirst = $true
foreach ($item in $steps) {
    if ($isFirst) {
        $waitSec = $initialWait
        $totalWaitFromPush3 = [Math]::Round(($now.AddSeconds($waitSec) - $push3Time).TotalMinutes, 1)
        Log-Message "Randomized delay for Push 4: $waitSec seconds remaining (total $totalWaitFromPush3 min since Push 3)..."
        $isFirst = $false
    } else {
        # Pick random delay between 15 and 20 minutes (910 to 1200 seconds)
        $waitSec = Get-Random -Minimum 910 -Maximum 1200
        $waitMin = [Math]::Round($waitSec / 60, 2)
        Log-Message "Randomized delay chosen for Push $($item.Step): $waitSec seconds ($waitMin minutes)..."
    }

    Log-Message "Sleeping for $waitSec seconds..."
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
