@echo off
REM Essential Testing Suite Runner for Windows
REM Runs all tests for the multi-platform auto response system

echo 🧪 Multi-Platform Auto Response System - Essential Testing Suite
echo ==============================================================

REM Check if n8n service is running
echo 📡 Checking n8n service availability...
set N8N_URL=http://localhost:5678
if "%N8N_BASE_URL%" NEQ "" set N8N_URL=%N8N_BASE_URL%

curl -s "%N8N_URL%/healthz" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ n8n service is running at %N8N_URL%
) else (
    echo ⚠️  n8n service not detected at %N8N_URL%
    echo    Tests will run but may skip integration scenarios
    echo    To start services: make up ^&^& make import ^&^& make activate
)

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing test dependencies...
    npm install
)

echo.
echo 🚀 Running Essential Tests...
echo.

REM Run tests
npm test
if %errorlevel% equ 0 (
    echo.
    echo ✅ All essential tests completed successfully!
    echo.
    echo 📊 Test Summary:
    echo    ✓ Turkish Instagram DM tests with diacritics validation
    echo    ✓ WhatsApp session mode tests ^(inside/outside 24h^)
    echo    ✓ Google Reviews tests ^(5-star auto-reply, 2-star alerts^)
    echo.
    echo 🎯 Requirements Coverage:
    echo    ✓ Requirement 10.1: Turkish Instagram DM test
    echo    ✓ Requirement 10.2: WhatsApp session mode tests
    echo    ✓ Requirement 10.3: Google Review response tests
    echo.
) else (
    echo.
    echo ❌ Some tests failed. Check the output above for details.
    echo.
    echo 🔧 Troubleshooting:
    echo    1. Ensure services are running: make up ^&^& make import ^&^& make activate
    echo    2. Check service logs: make logs
    echo    3. Verify webhook URLs are accessible
    echo    4. Review test output for specific error messages
    echo.
    exit /b 1
)