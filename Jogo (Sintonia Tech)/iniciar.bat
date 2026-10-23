
@echo off
title Highway Dodge
cd /d "%~dp0"

echo Iniciando Highway Dodge...
echo.

where py >nul 2>&1
if %errorlevel%==0 (
    set "PYTHON=py -3"
) else (
    where python >nul 2>&1
    if %errorlevel%==0 (
        set "PYTHON=python"
    ) else (
        echo ERRO: Python nao encontrado.
        pause
        exit /b 1
    )
)

if not exist "index.html" (
    echo ERRO: index.html nao encontrado.
    pause
    exit /b 1
)

start "" "http://localhost:5503/index.html"

echo Mantenha esta janela aberta.
%PYTHON% -m http.server 5503

pause
