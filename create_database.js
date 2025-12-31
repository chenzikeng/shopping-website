#!/usr/bin/env node

/**
 * 自动创建数据库脚本
 * 使用.env文件中的配置创建数据库
 */

const path = require('path');
require('dotenv').config();

console.log('自动创建数据库脚本');
console.log('=' * 50);

// 读取数据库配置
const config = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shopping_db'
};

console.log('当前配置:');
console.log(`  主机: ${config.host}`);
console.log(`  端口: ${config.port}`);
console.log(`  用户: ${config.user}`);
console.log(`  密码: ${config.password ? '已设置' : '未设置'}`);
console.log(`  数据库: ${config.database}`);
console.log('=' * 50);

// 尝试连接并创建数据库
try {
    const mysql = require('mysql2/promise');
    
    mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password
    })
    .then(async (connection) => {
        console.log('✅ 成功连接到MySQL服务器');
        
        // 创建数据库
        try {
            await connection.execute(
                `CREATE DATABASE IF NOT EXISTS ${config.database} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
            );
            console.log(`✅ 数据库 ${config.database} 创建成功`);
            
            // 授予权限
            await connection.execute(
                `GRANT ALL PRIVILEGES ON ${config.database}.* TO '${config.user}'@'localhost' WITH GRANT OPTION`
            );
            await connection.execute('FLUSH PRIVILEGES');
            console.log('✅ 权限设置成功');
            
            await connection.end();
            
            console.log('\n🎉 数据库创建完成！');
            console.log('\n接下来可以:');
            console.log('1. 同步数据库模型: node model_sync_test.js');
            console.log('2. 启动后端服务: node start_backend_safe.js');
            process.exit(0);
        } catch (err) {
            console.error('❌ 创建数据库失败:', err.message);
            await connection.end();
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ 连接到MySQL服务器失败:', err.message);
        console.log('\n可能的原因:');
        console.log('1. MySQL服务未启动');
        console.log('2. 用户名/密码不正确');
        console.log('3. 用户没有足够权限');
        process.exit(1);
    });
} catch (error) {
    console.error('❌ 加载依赖失败:', error.message);
    console.log('\n请安装mysql2依赖:');
    console.log('  npm install mysql2');
    process.exit(1);
}
