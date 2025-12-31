@echo off

:: 以管理员身份运行MySQL密码重置脚本
:: 适用于Windows系统

set "SCRIPT_DIR=%~dp0"
set "SCRIPT_NAME=reset_mysql_password.js"
set "NODE_PATH=%SCRIPT_DIR%node_modules\.bin"

:: 检查Node.js是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed!
    echo Please install Node.js first.
    pause
    exit /b 1
)

:: 检查脚本文件是否存在
if not exist "%SCRIPT_DIR%%SCRIPT_NAME%" (
    echo Error: %SCRIPT_NAME% not found!
    echo Current directory: %SCRIPT_DIR%
    pause
    exit /b 1
)

:: 切换到脚本目录
cd /d "%SCRIPT_DIR%"

echo MySQL Password Reset Tool
 echo =========================================
echo This will reset your MySQL root password to: Czk241203
echo =========================================
echo.
echo Press any key to continue...
pause >nul

:: 运行密码重置脚本
node "%SCRIPT_NAME%"

echo.
echo Press any key to exit...
pause >nul
