#!/usr/bin/env node

/**
 * 简单的MySQL密码更改启动器
 * 自动确保在正确的目录下运行
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('MySQL密码更改启动器');
console.log('=' * 50);

// 获取正确的脚本路径
const currentDir = __dirname;
const changeScriptPath = path.join(currentDir, 'change_mysql_password.js');

if (!fs.existsSync(changeScriptPath)) {
    console.error('❌ 错误: 密码更改脚本不存在');
    console.log('请确保 change_mysql_password.js 位于同一目录');
    process.exit(1);
}

// 获取命令行参数
const newPassword = process.argv[2];
if (!newPassword) {
    console.error('❌ 错误: 请提供新密码');
    console.log('用法: node run_change_password.js your_new_password');
    process.exit(1);
}

console.log(`\n要设置的新密码: ${newPassword}`);

// 检查当前目录是否正确
const expectedFile = path.join(currentDir, 'ALIBABA_CLOUD_DEPLOYMENT_GUIDE.md');
if (!fs.existsSync(expectedFile)) {
    console.error('❌ 错误: 不在正确的项目目录');
    console.log('当前目录:', currentDir);
    console.log('请确保在项目根目录运行');
    process.exit(1);
}

// 以管理员身份运行主脚本
console.log('\n正在以管理员身份运行密码更改工具...');
console.log('请在弹出的用户账户控制窗口中点击"是"');

let command;
if (process.platform === 'win32') {
    // Windows系统
    command = `powershell -Command "Start-Process 'node' -ArgumentList '\"${changeScriptPath}\"', '\"${newPassword}\"' -Verb RunAs`;
} else {
    // Linux/Mac系统
    command = `sudo node '${changeScriptPath}' '${newPassword}'`;
}

try {
    execSync(command, { encoding: 'utf8', stdio: 'inherit' });
    console.log('✅ 密码更改工具已启动');
} catch (error) {
    console.error('❌ 启动工具失败');
    console.log('错误信息:', error.message);
    console.log('\n手动运行方法:');
    console.log(`1. 以管理员身份打开命令提示符`);
    console.log(`2. 执行命令: cd /d '${currentDir}'`);
    console.log(`3. 执行命令: node change_mysql_password.js '${newPassword}'`);
    process.exit(1);
}

console.log('\n操作完成！');
