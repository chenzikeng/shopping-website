#!/usr/bin/env node

/**
 * 安全启动后端服务工具
 * 用于解决PowerShell执行策略限制问题
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

console.log('安全启动后端服务工具');
console.log('=' * 50);

// 检查是否在项目根目录
const backendPath = path.join(__dirname, 'backend');
if (!fs.existsSync(backendPath)) {
    console.error('错误: 请在项目根目录运行此脚本');
    process.exit(1);
}

// 检查后端目录中的package.json
const packageJsonPath = path.join(backendPath, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
    console.error('错误: 后端目录中缺少package.json文件');
    process.exit(1);
}

console.log('正在启动后端服务...');
console.log('路径:', backendPath);
console.log('=' * 50);

// 使用node直接运行server.js，绕过npm脚本限制
const serverJsPath = path.join(backendPath, 'server.js');

if (!fs.existsSync(serverJsPath)) {
    console.error('错误: 未找到server.js文件');
    process.exit(1);
}

// 进入backend目录并运行node server.js
const serverProcess = spawn('node', ['server.js'], {
    cwd: backendPath,
    stdio: 'inherit',
    shell: true
});

serverProcess.on('close', (code) => {
    console.log(`\n后端服务已退出，退出码: ${code}`);
});

serverProcess.on('error', (error) => {
    console.error('启动服务时出错:', error.message);
    process.exit(1);
});
