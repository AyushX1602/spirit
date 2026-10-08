@echo off
setlocal

set ROOT=%~dp0

echo Starting Spirit OS demo servers...
echo Backend:  http://localhost:3001
echo Frontend: http://localhost:5173
echo.

start "Spirit OS Backend" cmd /k "cd /d ""%ROOT%server"" && npm.cmd start"
start "Spirit OS Frontend" cmd /k "cd /d ""%ROOT%client"" && npm.cmd run dev"

echo Open http://localhost:5173 after both terminals say they are ready.
