#!/usr/bin/env node

/**
 * MySQL Root用户密码认证修复脚本
 * 解决ER_ACCESS_DENIED_NO_PASSWORD_ERROR错误
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 MySQL Root用户密码认证修复脚本');
console.log('=' . repeat(50));

// 读取.env文件获取配置
const envPath = path.join(__dirname, '.env');
let dbPassword;

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const passwordMatch = envContent.match(/DB_PASSWORD=(.+)/);
    dbPassword = passwordMatch ? passwordMatch[1] : 'Czk241203';
    console.log(`📝 从.env文件读取到密码: ${dbPassword}`);
} else {
    dbPassword = 'Czk241203';
    console.log(`⚠️  未找到.env文件，使用默认密码: ${dbPassword}`);
}

// 检查MySQL服务状态
console.log('\n🔍 检查MySQL服务状态...');
try {
    const statusOutput = execSync('sudo systemctl status mysql').toString();
    if (statusOutput.includes('active (running)')) {
        console.log('✅ MySQL服务正在运行');
    } else {
        console.log('⚠️ MySQL服务未运行，尝试启动...');
        execSync('sudo systemctl start mysql');
        console.log('✅ MySQL服务已启动');
    }
} catch (error) {
    console.log('❌ 检查MySQL状态失败，尝试直接启动...');
    try {
        execSync('sudo systemctl start mysql');
        console.log('✅ MySQL服务已启动');
    } catch (startError) {
        console.log('❌ 启动MySQL服务失败:', startError.message);
        process.exit(1);
    }
}

// 创建SQL修复脚本
const sqlFixScript = `
-- 切换到mysql数据库
USE mysql;

-- 查看当前root用户的认证方式
SELECT user, host, plugin FROM user WHERE user = 'root';

-- 修改root用户的认证方式为密码认证
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${dbPassword}';

-- 刷新权限
FLUSH PRIVILEGES;

-- 验证修改结果
SELECT user, host, plugin FROM user WHERE user = 'root';

-- 测试连接
SELECT 1+1 AS test_result;
`;

const sqlScriptPath = path.join(__dirname, 'fix_mysql_auth.sql');
fs.writeFileSync(sqlScriptPath, sqlFixScript);
console.log(`📄 创建了SQL修复脚本: ${sqlScriptPath}`);

// 执行SQL修复脚本
console.log('\n⚙️  执行MySQL认证修复...');
try {
    const fixOutput = execSync(`sudo mysql < "${sqlScriptPath}"`).toString();
    console.log('✅ MySQL认证修复成功!');
    console.log('📋 修复结果:');
    console.log(fixOutput);
} catch (error) {
    console.log('❌ MySQL修复失败:', error.message);
    process.exit(1);
}

// 测试数据库连接
console.log('\n🔗 测试数据库连接...');
try {
    const testOutput = execSync(`mysql -u root -p${dbPassword} -e "SELECT 'Connection successful' AS test_result;"`).toString();
    console.log('✅ 数据库连接成功!');
    console.log(testOutput);
} catch (error) {
    console.log('❌ 数据库连接测试失败:', error.message);
    process.exit(1);
}

// 检查shopping_db数据库是否存在
console.log('\n📊 检查shopping_db数据库...');
try {
    const dbCheckOutput = execSync(`mysql -u root -p${dbPassword} -e "SHOW DATABASES LIKE 'shopping_db';"`).toString();
    if (dbCheckOutput.includes('shopping_db')) {
        console.log('✅ shopping_db数据库已存在');
    } else {
        console.log('⚠️ shopping_db数据库不存在，尝试创建...');
        execSync(`mysql -u root -p${dbPassword} -e "CREATE DATABASE shopping_db;"`);
        console.log('✅ shopping_db数据库已创建');
    }
} catch (error) {
    console.log('❌ 数据库检查/创建失败:', error.message);
    process.exit(1);
}

// 清理临时文件
fs.unlinkSync(sqlScriptPath);
console.log(`\n🗑️  清理了临时文件: ${sqlScriptPath}`);

console.log('\n🎉 修复完成!');
console.log('=' . repeat(50));
console.log('现在可以运行:');
console.log('   node server_with_diagnostics.js');
console.log('或:');
console.log('   node server.js');
console.log('来启动服务器。');
