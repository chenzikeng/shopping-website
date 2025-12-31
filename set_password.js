#!/usr/bin/env node

/**
 * 简单的MySQL密码设置工具
 * 用法: node set_password.js your_mysql_password
 */

const fs = require('fs');
const path = require('path');

// 获取命令行参数
const args = process.argv.slice(2);

if (args.length === 0) {
    console.error('错误: 请提供MySQL密码作为参数');
    console.error('用法: node set_password.js your_mysql_password');
    process.exit(1);
}

const mysqlPassword = args[0];

console.log('MySQL密码设置工具');
console.log('=' * 50);
console.log(`要设置的密码: ${mysqlPassword}`);

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

// 解析当前配置
const dbUserMatch = envContent.match(/DB_USER=(.*)/);
const dbNameMatch = envContent.match(/DB_NAME=(.*)/);

const dbUser = dbUserMatch ? dbUserMatch[1] : 'root';
const dbName = dbNameMatch ? dbNameMatch[1] : 'shopping_db';

console.log('当前配置:');
console.log(`- 数据库用户: ${dbUser}`);
console.log(`- 数据库名称: ${dbName}`);
console.log('=' * 50);

console.log('正在更新配置文件...');

try {
    // 更新根目录的.env文件
    let newEnvContent = envContent.replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${mysqlPassword}`);
    fs.writeFileSync(envPath, newEnvContent, 'utf8');
    console.log(`✅ 更新成功: ${path.basename(envPath)}`);
    
    // 更新backend目录的.env文件
    let newBackendEnvContent = backendEnvContent.replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${mysqlPassword}`);
    fs.writeFileSync(backendEnvPath, newBackendEnvContent, 'utf8');
    console.log(`✅ 更新成功: ${path.join('backend', path.basename(backendEnvPath))}`);
    
    console.log('\n✅ 密码配置已更新！');
    
    // 检查是否安装了sequelize，用于测试连接
    try {
        require.resolve('sequelize');
        require.resolve('mysql2');
        
        console.log('\n正在测试数据库连接...');
        
        // 测试数据库连接
        const { Sequelize } = require('sequelize');
        const sequelize = new Sequelize(
            dbName,
            dbUser,
            mysqlPassword,
            {
                host: 'localhost',
                dialect: 'mysql',
                logging: false
            }
        );
        
        sequelize.authenticate()
            .then(() => {
                console.log('✅ 数据库连接成功！');
                console.log('\n可以启动后端服务了:');
                console.log('  cd backend && node server.js');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ 连接失败:', err.message);
                console.log('\n请检查:');
                console.log('1. MySQL服务是否正在运行');
                console.log('2. 密码是否正确');
                console.log('3. 用户是否有访问权限');
                process.exit(1);
            });
            
    } catch (error) {
        console.log('\n提示: 未安装sequelize，跳过连接测试');
        console.log('启动后端服务前，请确保MySQL服务正在运行');
        console.log('\n启动后端服务:');
        console.log('  cd backend && node server.js');
        process.exit(0);
    }
    
} catch (error) {
    console.error('❌ 更新文件失败:', error.message);
    process.exit(1);
}
