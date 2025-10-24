@echo off
REM CSV to JSON Converter API - Windows Setup Script
REM This script verifies the environment and provides setup guidance

echo.
echo ================================
echo CSV to JSON Converter Setup
echo ================================
echo.

REM Check Node.js
echo 1. Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    [OK] Node.js found: %NODE_VERSION%
) else (
    echo    [ERROR] Node.js not found. Please install Node.js 14+
    exit /b 1
)

REM Check npm
echo 2. Checking npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo    [OK] npm found: %NPM_VERSION%
) else (
    echo    [ERROR] npm not found
    exit /b 1
)

REM Check if node_modules exists
echo 3. Checking dependencies...
if exist "node_modules\" (
    echo    [OK] Dependencies installed
) else (
    echo    [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo    [ERROR] Failed to install dependencies
        exit /b 1
    )
    echo    [OK] Dependencies installed
)

REM Check .env file
echo 4. Checking configuration...
if exist ".env" (
    echo    [OK] .env file found
) else (
    echo    [ERROR] .env file not found
    exit /b 1
)

REM Check PostgreSQL
echo 5. Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('psql --version') do set PG_VERSION=%%i
    echo    [OK] PostgreSQL found: %PG_VERSION%
    
    REM Try to connect to database
    echo 6. Checking database...
    psql -U postgres -h localhost -d csv_converter -c "SELECT NOW();" >nul 2>&1
    if %errorlevel% equ 0 (
        echo    [OK] Database 'csv_converter' exists and is accessible
    ) else (
        echo    [WARNING] Database 'csv_converter' not found or not accessible
        echo    Run: createdb -U postgres -h localhost csv_converter
    )
) else (
    echo    [WARNING] PostgreSQL not found
    echo    Please install PostgreSQL from: https://www.postgresql.org/download/windows/
    echo.
    echo    After installing PostgreSQL, run:
    echo    createdb -U postgres -h localhost csv_converter
)

echo.
echo ================================
echo Setup Verification Complete
echo ================================
echo.
echo To start the application:
echo   npm start          (Production mode)
echo   npm run dev        (Development mode with auto-reload)
echo.
echo To run tests:
echo   npm test
echo.
pause
