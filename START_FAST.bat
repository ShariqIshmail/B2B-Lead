@echo off
REM ============================================
REM Lead CRM - Fast Launcher (No Install Check)
REM ============================================
REM Use this if dependencies are already installed
REM for faster startup

setlocal enabledelayedexpansion
set SCRIPT_DIR=%~dp0

echo.
echo ========================================
echo   Lead CRM - Fast Start
echo ========================================
echo.

REM Start backend
echo Starting backend on port 5000...
start "Lead CRM Backend" cmd /k "cd /d "%SCRIPT_DIR%backend" && npm start"

REM Wait for backend
timeout /t 3 /nobreak

REM Start frontend
echo Starting frontend on port 3000...
start "Lead CRM Frontend" cmd /k "cd /d "%SCRIPT_DIR%frontend" && npm start"

REM Wait for frontend to start
timeout /t 5 /nobreak

REM Open browser
echo Opening app...
start http://localhost:3000

echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
timeout /t 2 /nobreak
