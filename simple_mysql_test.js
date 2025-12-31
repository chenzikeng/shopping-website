#!/usr/bin/env node

/**
 * 简单的MySQL连接测试
 * 测试不同密码组合
 */

const fs = require('fs');
const path = require('path');

console.log('简单MySQL连接测试');
console.log('=' * 50);

// 尝试安装mysql2（如果不存在）
let mysql;
try {
    mysql = require('mysql2/promise');
    console.log('已找到mysql2模块');
} catch (error) {
    console.log('正在安装mysql2模块...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install mysql2', { stdio: 'inherit' });
        console.log('✅ mysql2安装成功');
        mysql = require('mysql2/promise');
    } catch (installError) {
        console.error('❌ mysql2安装失败');
        console.log('请手动安装: npm install mysql2');
        process.exit(1);
    }
}

// 检查MySQL服务状态
console.log('\n检查MySQL服务状态...');
const { execSync } = require('child_process');
try {
    const result = execSync('sc query MySQL', { encoding: 'utf8', stdio: 'pipe' });
    if (result.includes('RUNNING')) {
        console.log('✅ MySQL服务正在运行');
    } else {
        console.error('❌ MySQL服务未运行');
        console.log('请先启动服务: net start MySQL');
        process.exit(1);
    }
} catch (error) {
    console.error('⚠️  检查服务状态失败');
    console.log('可能的服务名称: MySQL, mysql, MySQL57, MySQL80');
    console.log('尝试其他服务名称...');
    
    const serviceNames = ['MySQL', 'mysql', 'MySQL57', 'MySQL80'];
    let runningService = null;
    
    for (const name of serviceNames) {
        try {
            const result = execSync(`sc query ${name}`, { encoding: 'utf8', stdio: 'pipe' });
            if (result.includes('RUNNING')) {
                runningService = name;
                break;
            }
        } catch (e) {
            // 忽略错误
        }
    }
    
    if (runningService) {
        console.log(`✅ 找到运行中的服务: ${runningService}`);
    } else {
        console.error('❌ 未找到任何运行中的MySQL服务');
        process.exit(1);
    }
}

// 测试连接函数
async function testConnection(password, description) {
    console.log(`\n测试 ${description}...`);
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            port: 3306,
            user: 'root',
            password: password
        });
        
        console.log(`✅ 连接成功！`);
        await connection.end();
        return true;
    } catch (error) {
        console.log(`❌ 失败: ${error.code}`);
        return false;
    }
}

// 开始测试
(async () => {
    console.log('\n开始测试连接...');
    
    // 测试空密码
    const emptySuccess = await testConnection('', '空密码');
    
    // 测试之前尝试的密码
    const czkSuccess = await testConnection('Czk241203', '密码: Czk241203');
    
    // 测试其他常见密码
    const commonPasswords = ['password', 'mysql', 'root', '123456'];
    for (const pwd of commonPasswords) {
        await testConnection(pwd, `密码: ${pwd}`);
    }
    
    console.log('\n' + '=' * 50);
    console.log('测试完成！');
    
    if (emptySuccess) {
        console.log('\n🎉 空密码连接成功！');
        console.log('请将.env文件中的DB_PASSWORD设置为空');
        console.log('运行: node set_password.js ""');
    } else if (czkSuccess) {
        console.log('\n🎉 密码 Czk241203 连接成功！');
        console.log('可能是权限问题，尝试重新设置密码');
    } else {
        console.log('\n❌ 所有测试密码均失败');
        console.log('请确认MySQL root用户的正确密码');
    }
    
    console.log('\n提示: 如果忘记密码，可以重置MySQL root密码');
    console.log('Windows重置方法: https://dev.mysql.com/doc/refman/8.0/en/resetting-permissions.html');
    
})();
