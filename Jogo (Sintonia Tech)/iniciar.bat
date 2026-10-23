
@echo off
setlocal
cd /d "%~dp0"

where py >nul 2>&1
if %errorlevel%==0 (
    start "Highway Dodge - Servidor" /min py -3 -m http.server 5500
) else (
    where python >nul 2>&1
    if %errorlevel%==0 (
        start "Highway Dodge - Servidor" /min python -m http.server 5500
    ) else (
        echo Python nao encontrado.
        echo Instale o Python ou use a extensao Live Server do VS Code.
        pause
        exit /b 1
    )
)

timeout /t 2 /nobreak >nul
start "" "http://localhost:5500/"
echo Jogo aberto em http://localhost:5500/
echo Feche a janela do servidor para encerrar.
pause
