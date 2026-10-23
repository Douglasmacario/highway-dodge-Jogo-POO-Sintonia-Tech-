
@echo off
title Highway Dodge
cd /d "%~dp0"

if not exist "index.html" (
    if exist "highway-dodge\index.html" (
        cd /d "highway-dodge"
    ) else (
        echo ERRO: index.html nao encontrado.
        pause
        exit /b 1
    )
)

echo Iniciando Highway Dodge...

where py >nul 2>&1
if %errorlevel%==0 (
    start "Servidor Highway Dodge" cmd /k "py -3 -m http.server 5502 --directory ""%CD%"""
) else (
    where python >nul 2>&1
    if %errorlevel%==0 (
        start "Servidor Highway Dodge" cmd /k "python -m http.server 5502 --directory ""%CD%"""
    ) else (
        echo Python nao encontrado.
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:5502/index.html"
exit
