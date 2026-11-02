@echo off
echo Starting AthleteHub Application...

echo Starting Backend...
start "AthleteHub Backend" cmd /c "%~dp0start_backend.bat"

echo Starting Frontend...
start "AthleteHub Frontend" cmd /c "%~dp0start_frontend.bat"

echo Both services are starting up in separate windows!
pause
