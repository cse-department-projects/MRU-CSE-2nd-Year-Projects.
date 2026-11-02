@echo off
echo Starting AthleteHub React Frontend...
cd /d "%~dp0frontend"
call npm.cmd run dev
if %ERRORLEVEL% NEQ 0 (
    call npm run dev
)
pause
