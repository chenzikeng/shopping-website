#!/usr/bin/env node

/**
 * MySQL密码设置工具
 * 用于解决MySQL未设置密码但.env文件中有密码配置的问题
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('MySQL密码设置工具');
console.log('=' * 50);

// 检查是否在项目根目录
const expectedPath = path.join(__dirname, 'ALIBABA_CLOUD_DEPLOYMENT_GUIDE.md');
if (!fs.existsSync(expectedPath)) {
    console.error('错误: 请在项目根目录运行此脚本');
    process.exit(1);
}

// 读取.env文件
const envPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

if (!fs.existsSync(envPath) || !fs.existsSync(backendEnvPath)) {
    console.error('错误: 未找到.env文件');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');

// 解析.env文件中的密码
const dbPasswordMatch = envContent.match(/DB_PASSWORD=(.*)/);
const dbPassword = dbPasswordMatch ? dbPasswordMatch[1] : '';

console.log(`当前.env文件中的密码配置: ${dbPassword}`);
console.log('MySQL当前状态: 未设置密码');
console.log('=' * 50);

console.log('请选择操作:');
console.log('1. 为MySQL root用户设置密码（推荐）');
console.log('2. 移除.env文件中的密码配置');
console.log('3. 退出');

// 读取用户输入
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('请输入选择 (1-3): ', (answer) => {
    rl.close();
    
    switch (answer) {
        case '1':
            setMysqlPassword();
            break;
        case '2':
            removeEnvPassword();
            break;
        case '3':
            console.log('退出工具');
            process.exit(0);
        default:
            console.error('错误: 无效的选择');
            process.exit(1);
    }
});

// 设置MySQL密码
function setMysqlPassword() {
    console.log(`正在为MySQL root用户设置密码: ${dbPassword}`);
    
    try {
        // 在Windows上设置MySQL密码的命令
        const command = `mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${dbPassword}'; FLUSH PRIVILEGES;"`;
        execSync(command, { stdio: 'inherit' });
        
        console.log('✅ MySQL密码设置成功！');
        console.log('现在.env文件中的密码与MySQL密码一致了。');
        testConnection();
    } catch (error) {
        console.error('❌ 设置密码失败:');
        console.error('可能的原因:');
        console.error('1. MySQL服务未启动');
        console.error('2. 命令行参数不正确');
        console.error('3. 当前用户没有足够权限');
        console.error('请尝试手动执行以下命令:');
        console.error(`mysql -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${dbPassword}'; FLUSH PRIVILEGES;"`);
    }
}

// 移除.env文件中的密码配置
function removeEnvPassword() {
    console.log('正在移除.env文件中的密码配置...');
    
    try {
        // 更新根目录的.env文件
        let newEnvContent = envContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=');
        fs.writeFileSync(envPath, newEnvContent, 'utf8');
        
        // 更新backend目录的.env文件
        let newBackendEnvContent = backendEnvContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=');
        fs.writeFileSync(backendEnvPath, newBackendEnvContent, 'utf8');
        
        console.log('✅ .env文件密码配置已移除！');
        console.log('现在.env文件将使用空密码连接MySQL。');
        testConnection();
    } catch (error) {
        console.error('❌ 更新.env文件失败:', error.message);
    }
}

// 测试数据库连接
function testConnection() {
    console.log('\n正在测试数据库连接...');
    
    try {
        const sequelize = require('./backend/config/db');
        console.log('✅ 数据库连接配置已更新！');
        console.log('请重新启动后端服务以应用更改。');
    } catch (error) {
        console.error('❌ 连接测试失败:', error.message);
        console.error('请检查MySQL服务是否正在运行。');
    }
}
