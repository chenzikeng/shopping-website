#!/usr/bin/env node

/**
 * 数据库连接测试工具
 * 正确读取.env文件配置并测试MySQL连接
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

console.log('数据库连接测试工具');
console.log('=' * 50);

// 检查.env文件是否存在
const envFilePath = path.join(__dirname, '.env');
if (fs.existsSync(envFilePath)) {
    console.log('✅ .env文件存在');
} else {
    console.error('❌ .env文件不存在');
    process.exit(1);
}

// 读取数据库配置
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'shopping_db'
};

console.log('\n当前数据库配置:');
console.log(`  主机: ${dbConfig.host}`);
console.log(`  端口: ${dbConfig.port}`);
console.log(`  用户: ${dbConfig.user}`);
console.log(`  密码: ${dbConfig.password ? '已设置' : '未设置'}`);
console.log(`  数据库: ${dbConfig.database}`);

// 测试数据库连接
console.log('\n正在测试数据库连接...');

try {
    const mysql = require('mysql2/promise');
    
    mysql.createConnection({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password
    })
    .then(async (connection) => {
        console.log('✅ 成功连接到MySQL服务器');
        
        // 检查数据库是否存在
        const [rows] = await connection.execute(
            `SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = '${dbConfig.database}'`
        );
        
        if (rows.length > 0) {
            console.log('✅ 数据库存在');
            await connection.end();
            
            // 测试完整的数据库连接
            const fullConnection = await mysql.createConnection(dbConfig);
            console.log('✅ 完整数据库连接成功');
            await fullConnection.end();
            
            console.log('\n🎉 所有测试通过！可以启动后端服务了');
            console.log('\n使用以下命令启动:');
            console.log('  node start_backend_safe.js');
            process.exit(0);
        } else {
            console.log('⚠️  数据库不存在');
            console.log('\n需要创建数据库:');
            console.log(`  mysql -u ${dbConfig.user} -p -e "CREATE DATABASE ${dbConfig.database};"`);
            console.log('\n输入密码时直接按回车（如果没有密码）或输入实际密码');
            await connection.end();
            process.exit(1);
        }
    })
    .catch(err => {
        console.error('❌ 连接失败:', err.message);
        console.log('\n可能的原因:');
        console.log('1. MySQL服务未启动');
        console.log('2. 用户名/密码不正确');
        console.log('3. 用户没有访问权限');
        console.log('\n请检查:');
        console.log('- .env文件中的DB_PASSWORD是否正确（当前密码:', dbConfig.password, '）');
        console.log('- MySQL服务是否正在运行');
        console.log('- root用户是否能正常登录');
        process.exit(1);
    });
} catch (error) {
    console.error('❌ 测试连接时出错:', error.message);
    console.log('\n请确保已安装mysql2依赖:');
    console.log('  npm install mysql2');
    process.exit(1);
}
