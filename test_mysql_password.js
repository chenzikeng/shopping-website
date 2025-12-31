#!/usr/bin/env node

/**
 * MySQL密码测试工具
 * 用于验证MySQL连接
 */

const fs = require('fs');
const path = require('path');

console.log('MySQL密码测试工具');
console.log('=' * 50);

// 默认测试配置
const testConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: process.argv[2] || '',
    database: 'shopping_db'
};

console.log('测试配置:');
console.log(`- 主机: ${testConfig.host}`);
console.log(`- 端口: ${testConfig.port}`);
console.log(`- 用户: ${testConfig.user}`);
console.log(`- 密码: ${testConfig.password ? '已提供' : '未提供'}`);
console.log(`- 数据库: ${testConfig.database}`);
console.log('=' * 50);

// 检查MySQL是否正在运行
const { execSync } = require('child_process');
try {
    const result = execSync('sc query MySQL', { encoding: 'utf8', stdio: 'pipe' });
    if (result.includes('RUNNING')) {
        console.log('✅ MySQL服务正在运行');
    } else {
        console.error('❌ MySQL服务未运行');
        console.log('请先启动MySQL服务: net start MySQL');
        process.exit(1);
    }
} catch (error) {
    console.error('❌ 检查MySQL服务状态失败');
    console.log('错误信息:', error.message);
    console.log('请手动检查MySQL服务是否正在运行');
}

// 尝试连接到MySQL
console.log('\n正在尝试连接到MySQL...');

try {
    const mysql = require('mysql2/promise');
    
    (async () => {
        try {
            // 首先尝试连接到MySQL服务器
            const connection = await mysql.createConnection({
                host: testConfig.host,
                port: testConfig.port,
                user: testConfig.user,
                password: testConfig.password
            });
            
            console.log('✅ 成功连接到MySQL服务器！');
            
            // 检查数据库是否存在
            const [rows] = await connection.execute('SHOW DATABASES LIKE ?', [testConfig.database]);
            
            if (rows.length > 0) {
                console.log(`✅ 数据库 ${testConfig.database} 已存在`);
            } else {
                console.log(`⚠️  数据库 ${testConfig.database} 不存在，正在创建...`);
                await connection.execute(`CREATE DATABASE ${testConfig.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
                console.log(`✅ 成功创建数据库 ${testConfig.database}`);
            }
            
            await connection.end();
            
            // 测试完整连接
            console.log('\n正在测试完整数据库连接...');
            const fullConnection = await mysql.createConnection({
                host: testConfig.host,
                port: testConfig.port,
                user: testConfig.user,
                password: testConfig.password,
                database: testConfig.database
            });
            
            await fullConnection.execute('SELECT 1');
            console.log('✅ 完整数据库连接成功！');
            await fullConnection.end();
            
            console.log('\n🎉 所有测试通过！密码正确！');
            console.log('\n您可以启动后端服务了:');
            console.log('  cd backend && node server.js');
            process.exit(0);
            
        } catch (error) {
            console.error('❌ 连接失败:', error.message);
            
            if (error.message.includes('Access denied')) {
                console.log('\n可能的原因:');
                console.log('1. 密码错误 - 请检查您的MySQL密码');
                console.log('2. 用户权限 - root用户可能没有本地访问权限');
                console.log('3. MySQL配置 - 可能限制了root用户的访问');
            } else if (error.message.includes('Unknown database')) {
                console.log('\n数据库不存在，但连接到服务器成功！');
                console.log('密码是正确的！');
                process.exit(0);
            }
            
            process.exit(1);
        }
    })();
    
} catch (error) {
    console.error('❌ 缺少mysql2模块，请先安装:');
    console.log('  npm install mysql2');
    process.exit(1);
}
