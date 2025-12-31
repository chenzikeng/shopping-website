@echo off

REM MySQL密码更改启动脚本
REM 双击运行此文件或在命令行中执行

set "SCRIPT_PATH=d:/trae/shopping web/change_mysql_password.js"
set "NODE_EXE=node"

REM 检查脚本是否存在
if not exist "%SCRIPT_PATH%" (
    echo 错误：脚本文件不存在
    echo 请确保脚本位于：%SCRIPT_PATH%
    pause
    exit /b 1
)

REM 检查node是否安装
where %NODE_EXE% >nul 2>nul
if %errorlevel% neq 0 (
    echo 错误：未找到Node.js
    echo 请先安装Node.js
    pause
    exit /b 1
)

REM 提示用户输入新密码
set /p NEW_PASSWORD=请输入MySQL新密码：

if "%NEW_PASSWORD%"=="" (
    echo 错误：密码不能为空
    pause
    exit /b 1
)

REM 以管理员身份运行密码更改脚本
echo 正在以管理员身份运行密码更改工具...
echo 请在弹出的UAC窗口中点击"是"

REM 使用PowerShell以管理员身份运行
powershell -Command "Start-Process 'node' -ArgumentList '\''%SCRIPT_PATH%\'\'', '\''%NEW_PASSWORD%\'\'' -Verb RunAs"

REM 等待用户确认
pause
