@echo off
REM ============================================================
REM HPC Share - Installation Script (Windows)
REM ============================================================

echo ============================================================
echo HPC SHARE - INSTALLATION SCRIPT
echo ============================================================

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js v18+
    echo         Visit: https://nodejs.org/
    exit /b 1
)

for /f "tokens=1 delims=." %%a in ('node -v') do set NODE_MAJOR=%%a
set NODE_MAJOR=%NODE_MAJOR:~1%
if %NODE_MAJOR% LSS 18 (
    echo [ERROR] Node.js version %NODE_MAJOR% detected. Please upgrade to v18+
    exit /b 1
)
echo [OK] Node.js detected

REM Check npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found. Please reinstall Node.js
    exit /b 1
)
echo [OK] npm detected

REM Create .env if not exists
if not exist .env (
    echo Creating .env from .env.example...
    if exist .env.example (
        copy .env.example .env
        echo [WARN] Please edit .env with your API keys and addresses
    ) else (
        echo [ERROR] .env.example not found
    )
) else (
    echo [OK] .env already exists
)

REM Install dependencies
echo Installing npm dependencies...
call npm install

REM Create directories
echo Creating directories...
if not exist config mkdir config
if not exist logs mkdir logs
if not exist reports mkdir reports

REM Create default config files
if not exist config\investors.json (
    echo [] > config\investors.json
    echo [OK] Created config\investors.json
)

if not exist config\revenue.json (
    copy NUL config\revenue.json
    echo [OK] Created config\revenue.json
)

REM Compile contracts
if exist hardhat.config.js (
    echo Compiling smart contracts...
    call npx hardhat compile
)

REM Run tests
if exist test (
    echo Running tests...
    call npx hardhat test
)

REM Interface setup
if exist interface (
    echo Setting up interface...
    cd interface
    if not exist node_modules (
        call npm install
    )
    cd ..
)

echo.
echo ============================================================
echo INSTALLATION COMPLETE!
echo ============================================================
echo.
echo Next steps:
echo   1. Edit .env with your API keys
echo   2. Run setup wizard: open interface\setup.html in browser
echo   3. Or deploy manually: npx hardhat run scripts/deploy.js --network polygon
echo   4. Start interface: cd interface ^&^& npx serve . -p 3000
echo   5. Open browser to http://localhost:3000
echo.