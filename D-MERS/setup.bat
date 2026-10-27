@echo off
cd /d "%~dp0"
TITLE Disaster Management System - Setup & Dependency Installer
COLOR 0A
cls

echo ====================================================================
echo  DISASTER MANAGEMENT ^& EMERGENCY RESPONSE SYSTEM - AUTOMATED SETUP
echo ====================================================================
echo.

:: 1. Check Java Installation
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java is NOT installed or not added to system PATH!
    echo Please install Java 17 or newer JDK from https://adoptium.net/
    pause
    exit /b 1
)
echo [OK] Java detected successfully.
echo.

:: 2. Create required project directories
if not exist "%~dp0lib" mkdir "%~dp0lib"
if not exist "%~dp0bin" mkdir "%~dp0bin"
if not exist "%~dp0exports" mkdir "%~dp0exports"

:: 3. Download dependencies into lib/ via PowerShell
echo [INFO] Checking / Downloading required JAR dependencies (JavaFX + MySQL Driver)...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0download_deps.ps1"

:: 4. Compile Java Source Code via PowerShell
echo.
echo [INFO] Compiling Java source files...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0compile.ps1"

echo.
echo ====================================================================
echo  SETUP COMPLETE! You can now launch the app by running run.bat
echo ====================================================================
pause
