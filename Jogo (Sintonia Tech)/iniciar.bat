
@echo off
title Highway Dodge

cd /d "%~dp0"

if not exist "index.html" (
    echo ERRO: index.html nao encontrado!
    pause
    exit /b 1
)

echo Iniciando Highway Dodge...
echo Mantenha esta janela aberta.
echo.

where py >nul 2>&1
if %errorlevel%==0 (
    start "" "http://localhost:5503/index.html"
    py -3 -m http.server 5503
) else (
    start "" "http://localhost:5503/index.html"
    python -m http.server 5503
)

echo.
echo Servidor encerrado ou ocorreu um erro.
pause
