#!/usr/bin/env node

/**
 * 数据库连接修复脚本
 * 用于修复 "Access denied for user 'root'@'localhost'" 错误
 */

const fs = require('fs');
const path = require('path');

console.log('=== 数据库连接修复工具 ===\n');

// 检查当前目录
const currentDir = process.cwd();
console.log(`当前工作目录: ${currentDir}`);

// 检查是否在backend目录下
if (!fs.existsSync(path.join(currentDir, 'package.json')) || !fs.existsSync(path.join(currentDir, 'config', 'db.js'))) {
    console.error('错误: 请在backend目录下运行此脚本!');
    console.log('请执行: cd backend && node ../fix_db_connection.js');
    process.exit(1);
}

// 读取.env文件
const envPath = path.join(currentDir, '.env');
if (!fs.existsSync(envPath)) {
    console.error('错误: .env文件不存在!');
    console.log('请先运行: cp .env.example .env 并配置环境变量');
    process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
console.log('\n当前.env文件配置:');
console.log('='.repeat(50));

// 解析.env文件
const envVars = {};
envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
        const [key, value] = line.split('=');
        if (key && value) {
            envVars[key] = value;
        }
    }
});

// 显示数据库配置
console.log('数据库配置:');
console.log(`- DB_HOST: ${envVars.DB_HOST || '未设置'}`);
console.log(`- DB_USER: ${envVars.DB_USER || '未设置'}`);
console.log(`- DB_PASSWORD: ${envVars.DB_PASSWORD ? '***' : '未设置'}`);
console.log(`- DB_NAME: ${envVars.DB_NAME || '未设置'}`);
console.log('='.repeat(50));

// 生成MySQL配置命令
console.log('\n修复步骤:');
console.log('1. 请确保您知道MySQL root用户的正确密码');
console.log('2. 如果您忘记了密码，需要重置MySQL root密码');
console.log('3. 运行以下命令来修复数据库权限:');
console.log('='.repeat(50));

if (envVars.DB_PASSWORD) {
    console.log('\n--- MySQL命令行操作 (在服务器上执行) ---');
    console.log('mysql -u root -p');
    console.log('然后输入您的MySQL root密码');
    console.log('\n在MySQL命令行中执行:');
    console.log(`CREATE DATABASE IF NOT EXISTS ${envVars.DB_NAME || 'shopping_db'};`);
    console.log(`GRANT ALL PRIVILEGES ON ${envVars.DB_NAME || 'shopping_db'}.* TO '${envVars.DB_USER || 'root'}'@'localhost' WITH GRANT OPTION;`);
    console.log('FLUSH PRIVILEGES;');
    console.log('EXIT;');
    
    console.log('\n--- 验证连接 (在服务器上执行) ---');
    console.log(`cd /home/shopping\ web/backend`);
    console.log('node -e "require(\'dotenv\').config(); const { Sequelize } = require(\'sequelize\'); const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, dialect: \'mysql\' }); sequelize.authenticate().then(() => console.log(\'连接成功!\')).catch(err => console.error(\'连接失败:\', err))"');
} else {
    console.error('错误: 请先在.env文件中设置正确的DB_PASSWORD!');
}

console.log('\n='.repeat(50));
console.log('常见问题及解决方案:');
console.log('1. MySQL root密码错误: 重置MySQL root密码');
console.log('2. .env文件密码不匹配: 更新.env文件中的DB_PASSWORD');
console.log('3. 权限不足: 重新运行GRANT命令授予权限');
console.log('4. 数据库不存在: 运行CREATE DATABASE命令创建数据库');
console.log('\n修复完成后，重新启动服务器:');
console.log('node server.js');