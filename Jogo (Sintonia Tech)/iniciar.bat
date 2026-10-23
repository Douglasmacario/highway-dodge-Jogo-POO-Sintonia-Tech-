
@echo off
title Highway Dodge

cd /d "%~dp0"

if not exist "index.html" (
    if exist "highway-dodge\index.html" (
        cd /d "highway-dodge"
    )
)

if not exist "index.html" (
    echo ERRO: index.html nao encontrado!
    echo.
    echo Pasta atual:
    cd
    echo.
    echo Arquivos encontrados:
    dir /b
    pause
    exit /b 1
)

echo Iniciando Highway Dodge...
echo.
echo Mantenha esta janela aberta durante o jogo.

where py >nul 2>&1
if %errorlevel%==0 (
    start "" "http://localhost:5503/index.html"
    py -3 -m http.server 5503
) else (
    start "" "http://localhost:5503/index.html"
    python -m http.server 5503
)

pause
