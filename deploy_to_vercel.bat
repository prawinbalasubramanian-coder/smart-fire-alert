@echo off
title AI Smart Fire Alert System - Vercel Deployment
echo ========================================================
echo AI Smart Fire Alert System - Deploy to Vercel (New Project)
echo ========================================================
echo.
echo [Setup Notice]
echo When prompted by Vercel CLI:
echo   - Set up and deploy?                     -> [Y]
echo   - Which scope?                           -> (Your Vercel Account)
echo   - Link to existing project?              -> [N] (Important: Choose NO for a new project)
echo   - What's your project's name?            -> smart-fire-alert-system
echo   - In which directory is your code?       -> ./
echo   - Want to modify these settings?         -> [N]
echo ========================================================
echo.
echo Select deployment mode:
echo   [1] Deploy Preview (Test build)
echo   [2] Deploy to Production (--prod)
echo.
set /p choice="Enter choice (1 or 2): "

if "%choice%"=="2" (
    echo.
    echo [System] Deploying to Vercel Production...
    npx --yes vercel --prod
) else (
    echo.
    echo [System] Deploying to Vercel Preview...
    npx --yes vercel
)

echo.
pause
