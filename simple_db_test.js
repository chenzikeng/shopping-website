#!/usr/bin/env node

/**
 * 简单数据库连接测试
 * 显示详细的连接信息和错误原因
 */

const path = require('path');
require('dotenv').config();

console.log('数据库连接测试');
console.log('=' * 50);

// 显示当前环境变量
console.log('当前配置:');
console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`  DB_HOST: ${process.env.DB_HOST}`);
console.log(`  DB_PORT: ${process.env.DB_PORT}`);
console.log(`  DB_USER: ${process.env.DB_USER}`);
console.log(`  DB_PASSWORD: ${process.env.DB_PASSWORD}`);
console.log(`  DB_NAME: ${process.env.DB_NAME}`);
console.log('=' * 50);

// 检查必要的配置
if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_NAME) {
    console.error('❌ 配置不完整！请检查.env文件');
    process.exit(1);
}

// 测试连接
console.log('\n开始测试连接...');

try {
    const mysql = require('mysql2');
    
    // 创建连接
    const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    });
    
    connection.connect((err) => {
        if (err) {
            console.error('❌ 连接到MySQL服务器失败:');
            console.error('   错误代码:', err.code);
            console.error('   错误信息:', err.message);
            console.log('\n可能的原因:');
            console.log('1. MySQL服务未启动');
            console.log('2. 用户名不正确');
            console.log('3. 密码不正确');
            console.log('4. 用户没有连接权限');
            console.log('5. 网络/防火墙问题');
            process.exit(1);
        }
        
        console.log('✅ 成功连接到MySQL服务器！');
        
        // 检查数据库是否存在
        connection.query(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${process.env.DB_NAME}'`,
            (err, results) => {
                if (err) {
                    console.error('❌ 检查数据库失败:', err.message);
                    connection.end();
                    process.exit(1);
                }
                
                if (results.length === 0) {
                    console.log('⚠️  数据库不存在:', process.env.DB_NAME);
                    console.log('\n需要创建数据库:');
                    console.log(`mysql -u ${process.env.DB_USER} -p${process.env.DB_PASSWORD} -e "CREATE DATABASE ${process.env.DB_NAME};"`);
                } else {
                    console.log('✅ 数据库存在:', process.env.DB_NAME);
                    
                    // 测试完整连接
                    connection.changeUser({ database: process.env.DB_NAME }, (err) => {
                        if (err) {
                            console.error('❌ 切换到数据库失败:', err.message);
                        } else {
                            console.log('✅ 成功切换到数据库！');
                        }
                        connection.end();
                    });
                }
            }
        );
    });
    
} catch (error) {
    console.error('❌ 加载mysql2模块失败:', error.message);
    console.log('\n请安装mysql2依赖:');
    console.log('npm install mysql2');
    process.exit(1);
}
