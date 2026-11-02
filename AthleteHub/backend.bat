@echo off
setlocal enabledelayedexpansion
title AthleteHub Backend Server
:: Load local environment variables
if exist "%~dp0.env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in ("%~dp0.env") do (
        set "%%A=%%B"
    )
) else (
    echo [ERROR] .env file not found in project root!
    pause
    exit /b 1
)

echo ===================================================
echo        AthleteHub Spring Boot Backend Launcher
echo ===================================================

cd /d "%~dp0backend"

:: Configure Java 25
if exist "C:\Program Files\Java\jdk-25" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-25"
    set "PATH=C:\Program Files\Java\jdk-25\bin;!PATH!"
    echo [OK] Using Java 25 from: !JAVA_HOME!
) else (
    echo [WARN] Java 25 not found in default path, using current JAVA_HOME: %JAVA_HOME%
)

:: Find Maven
set "MVN_CMD="
if exist "%~dp0maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0maven\apache-maven-3.9.6\bin\mvn.cmd"
) else if exist "C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.2.3\plugins\maven\lib\maven3\bin\mvn.cmd" (
    set "MVN_CMD=C:\Program Files\JetBrains\IntelliJ IDEA Community Edition 2025.2.3\plugins\maven\lib\maven3\bin\mvn.cmd"
) else if exist "%~dp0..\maven\apache-maven-3.9.6\bin\mvn.cmd" (
    set "MVN_CMD=%~dp0..\maven\apache-maven-3.9.6\bin\mvn.cmd"
) else (
    where mvn >nul 2>&1
    if !errorlevel! equ 0 (
        set "MVN_CMD=mvn"
    )
)

if not defined MVN_CMD (
    echo [ERROR] Maven not found! Please ensure Maven is installed or IntelliJ IDEA is present.
    pause
    exit /b 1
)

echo [OK] Using Maven: !MVN_CMD!

:: Free port 8080 if already in use
echo [INFO] Checking port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo [INFO] Terminating previous process on port 8080 with PID %%a
    taskkill /F /PID %%a >nul 2>&1
)

echo ===================================================
echo Starting Spring Boot on http://localhost:8080 ...
echo Press Ctrl+C to stop the backend.
echo ===================================================

call "!MVN_CMD!" spring-boot:run

if !errorlevel! neq 0 (
    echo.
    echo [ERROR] Spring Boot backend stopped with error code !errorlevel!.
)

pause
