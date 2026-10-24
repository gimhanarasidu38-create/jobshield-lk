@echo off
setlocal
cd /d "%~dp0"
title JobShield LK - Local Demo

echo =========================================
echo         JobShield LK - Local Demo
echo =========================================
echo.
where node >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js was not found.
    echo Install Node.js version 20 or newer from https://nodejs.org/
    echo Then close and reopen this window and try again.
    pause
    exit /b 1
)
echo Detected:
node --version
echo.
if not exist ".env" (
    copy /y ".env.example" ".env" >nul
    echo Created .env from .env.example
    echo Optional: Edit .env to add your Gemini or Claude API key.
) else (
    echo Using your existing .env (not overwritten).
)
echo.
echo Open http://localhost:3000 in your browser.
echo To stop the server, press Ctrl+C.
echo If port 3000 is busy, use PowerShell: $env:PORT="3001"; .\START_WINDOWS.bat
echo.
node src\server.js
if errorlevel 1 (
    echo.
    echo Server stopped with an error. See the message above.
    pause
)
endlocal
