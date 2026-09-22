@echo off
REM ============================================
REM Lead CRM - Launcher Script
REM ============================================
REM This script starts the backend and frontend
REM and opens the app in your default browser

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Lead Management & Email CRM
echo   Starting Application...
echo ========================================
echo.

REM Get the directory of this script
set SCRIPT_DIR=%~dp0

REM Check if Node.js is installed
echo [1/4] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Node.js is not installed or not on PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo OK - Node.js found

REM Check if backend exists
echo [2/4] Checking backend...
if not exist "%SCRIPT_DIR%backend\package.json" (
    echo ERROR: backend folder not found
    pause
    exit /b 1
)
echo OK - Backend folder found

REM Check if frontend exists
echo [3/4] Checking frontend...
if not exist "%SCRIPT_DIR%frontend\package.json" (
    echo ERROR: frontend folder not found
    pause
    exit /b 1
)
echo OK - Frontend folder found

echo.
echo [4/4] Starting servers...
echo.

REM Start backend in a new window
echo Starting backend on port 5000...
start "Lead CRM Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm start"

REM Wait for backend to start
echo Waiting for backend to start...
timeout /t 5 /nobreak

REM Start frontend in a new window
echo Starting frontend on port 3000...
start "Lead CRM Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm start"

REM Wait for frontend to start
echo Waiting for frontend to start...
timeout /t 8 /nobreak

REM Open app in default browser
echo.
echo Opening app in default browser...
start http://localhost:3000

echo.
echo ========================================
echo   ✓ Application Started!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Two command windows have opened:
echo   - "Lead CRM Backend" runs the API server
echo   - "Lead CRM Frontend" runs the React app
echo.
echo To stop the application:
echo   1. Close the browser tab
echo   2. Close both command windows
echo.
echo To restart, run this script again
echo ========================================
echo.

timeout /t 3 /nobreak
