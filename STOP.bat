@echo off
REM ============================================
REM Lead CRM - Stop Script
REM ============================================
REM Stops the backend and frontend servers

echo.
echo ========================================
echo   Stopping Lead CRM Services
echo ========================================
echo.

REM Kill Node processes
echo Stopping servers...
taskkill /F /IM node.exe /T >nul 2>nul

if %ERRORLEVEL% EQU 0 (
    echo OK - Servers stopped
) else (
    echo WARNING: No Node.js processes found
)

REM Kill cmd windows
echo Closing windows...
taskkill /F /FI "WINDOWTITLE eq Lead CRM Backend" >nul 2>nul
taskkill /F /FI "WINDOWTITLE eq Lead CRM Frontend" >nul 2>nul

echo.
echo ========================================
echo   ✓ Lead CRM Stopped
echo ========================================
echo.

timeout /t 2 /nobreak
