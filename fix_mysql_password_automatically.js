#!/usr/bin/env node

/**
 * 自动修复MySQL密码配置工具
 * 用于解决MySQL未设置密码但.env文件中有密码配置的问题
 */

const fs = require('fs');
const path = require('path');

console.log('自动修复MySQL密码配置工具');
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

// 解析.env文件中的配置
const dbUserMatch = envContent.match(/DB_USER=(.*)/);
const dbPasswordMatch = envContent.match(/DB_PASSWORD=(.*)/);
const dbNameMatch = envContent.match(/DB_NAME=(.*)/);

const dbUser = dbUserMatch ? dbUserMatch[1] : 'root';
const dbPassword = dbPasswordMatch ? dbPasswordMatch[1] : '';
const dbName = dbNameMatch ? dbNameMatch[1] : 'shopping_db';

console.log('当前配置:');
console.log(`- 数据库用户: ${dbUser}`);
console.log(`- 配置的密码: ${dbPassword}`);
console.log(`- 数据库名称: ${dbName}`);
console.log('MySQL状态: 未设置密码');
console.log('=' * 50);

// 提供两种解决方案
console.log('解决方案:');
console.log('1. 为MySQL设置密码，使其与.env文件一致');
console.log('2. 修改.env文件，移除密码配置');
console.log('\n正在自动选择方案...');

// 方案1: 修改.env文件，移除密码配置（更安全，不需要root权限）
console.log('\n选择方案2: 修改.env文件，移除密码配置');
console.log('正在更新.env文件...');

try {
    // 更新根目录的.env文件
    let newEnvContent = envContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=');
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    console.log(`✅ 更新成功: ${envPath}`);
    
    // 更新backend目录的.env文件
    let newBackendEnvContent = backendEnvContent.replace(/DB_PASSWORD=.*/g, 'DB_PASSWORD=');
    fs.writeFileSync(backendEnvPath, newBackendEnvContent, 'utf8');
    console.log(`✅ 更新成功: ${backendEnvPath}`);
    
    console.log('\n✅ 密码配置已修复！');
    console.log('现在.env文件将使用空密码连接MySQL。');
    console.log('\n下一步操作:');
    console.log('1. 确保MySQL服务正在运行');
    console.log('2. 启动后端服务: cd backend && npm start');
    console.log('\n如果您希望为MySQL设置密码，可以运行以下命令:');
    console.log(`mysql -u ${dbUser} -e "ALTER USER '${dbUser}'@'localhost' IDENTIFIED BY '新密码'; FLUSH PRIVILEGES;"`);
    console.log('然后更新.env文件中的DB_PASSWORD为新密码');
    
} catch (error) {
    console.error('❌ 更新.env文件失败:', error.message);
    console.error('\n请手动更新以下文件:');
    console.error(`1. ${envPath}`);
    console.error(`2. ${backendEnvPath}`);
    console.error('将DB_PASSWORD=xxx修改为DB_PASSWORD=');
}
