@echo off
cd /d "%~dp0"
TITLE Disaster Management and Emergency Response System
COLOR 0B
cls

echo ====================================================================
echo  DISASTER MANAGEMENT ^& EMERGENCY RESPONSE SYSTEM
echo ====================================================================
echo.

:: 1. Verify Java Installation
java -version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java standard launcher not found in PATH!
    if exist "C:\Program Files\Java\jdk-26.0.1\bin\java.exe" (
        SET JAVA_CMD="C:\Program Files\Java\jdk-26.0.1\bin\java.exe"
    ) else (
        echo Please install Java 17 or JDK 26 from https://adoptium.net/
        pause
        exit /b 1
    )
) else (
    SET JAVA_CMD=java
)

:: 2. Auto-run setup if bin or lib missing
if not exist "%~dp0bin\com\disastermanagement\AppLauncher.class" (
    echo [INFO] Binaries not found. Running setup script...
    call "%~dp0setup.bat"
)

:: 3. Launch Application using AppLauncher & JavaFX module path
echo [INFO] Launching Disaster Management System...
echo.

%JAVA_CMD% --module-path "%~dp0lib\javafx-controls-21.0.1-win.jar;%~dp0lib\javafx-graphics-21.0.1-win.jar;%~dp0lib\javafx-base-21.0.1-win.jar;%~dp0lib\javafx-fxml-21.0.1-win.jar" --add-modules javafx.controls,javafx.fxml,javafx.graphics -cp "%~dp0bin;%~dp0lib/*;%~dp0src/main/resources" com.disastermanagement.AppLauncher

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Application exited with code %ERRORLEVEL%.
    pause
)
