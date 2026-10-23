
@echo off
cd /d "%~dp0"

echo Iniciando Highway Dodge...

where py >nul 2>&1
if %errorlevel%==0 (
    start "Highway Dodge" cmd /k "py -3 -m http.server 5501"
) else (
    start "Highway Dodge" cmd /k "python -m http.server 5501"
)

timeout /t 2 /nobreak >nul

start "" "http://localhost:5501/index.html"
