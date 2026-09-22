@echo off
REM ============================================
REM Lead CRM - Setup Script
REM ============================================
REM Run this once to install all dependencies
REM and initialize the database

setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

echo.
echo ========================================
echo   Lead CRM - Setup
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo OK - Node.js %NODE_VERSION% found

REM Check PostgreSQL
echo [2/5] Checking PostgreSQL...
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: PostgreSQL not found on PATH
    echo Make sure PostgreSQL is installed and running
    echo Download from: https://www.postgresql.org/download/
)
echo OK

REM Install backend
echo [3/5] Installing backend dependencies...
cd /d "%SCRIPT_DIR%backend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
echo OK - Backend installed

REM Install frontend
echo [4/5] Installing frontend dependencies...
cd /d "%SCRIPT_DIR%frontend"
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install frontend dependencies
    pause
    exit /b 1
)
echo OK - Frontend installed

REM Initialize database
echo [5/5] Initializing database...
cd /d "%SCRIPT_DIR%backend"
call npm run init-db
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Database initialization failed
    echo Make sure PostgreSQL is running and .env is configured
    echo See BACKEND_SETUP.md for details
    echo.
)
echo OK

echo.
echo ========================================
echo   ✓ Setup Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit backend\.env with your database password
echo   2. Run START.bat to launch the app
echo.
pause
