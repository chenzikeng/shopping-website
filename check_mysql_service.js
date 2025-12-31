#!/usr/bin/env node

/**
 * MySQL服务检查工具
 * 用于检查MySQL服务是否正在运行
 */

const { execSync } = require('child_process');
const os = require('os');

console.log('MySQL服务检查工具');
console.log('=' * 50);

const platform = os.platform();
console.log(`当前操作系统: ${platform}`);

// 根据不同操作系统检查MySQL服务
if (platform === 'win32') {
    console.log('Windows系统 - 检查MySQL服务...');
    checkWindowsMySQL();
} else if (platform === 'linux') {
    console.log('Linux系统 - 检查MySQL服务...');
    checkLinuxMySQL();
} else {
    console.log(`不支持的操作系统: ${platform}`);
    console.log('请手动检查MySQL服务状态。');
    process.exit(1);
}

function checkWindowsMySQL() {
    try {
        // 使用sc命令检查MySQL服务状态
        const output = execSync('sc query MySQL 2>&1', { encoding: 'utf8' });
        
        if (output.includes('RUNNING')) {
            console.log('✅ MySQL服务正在运行');
            testConnection();
        } else if (output.includes('STOPPED')) {
            console.log('❌ MySQL服务已停止');
            startWindowsMySQL();
        } else {
            console.log('⚠️ MySQL服务状态未知:');
            console.log(output);
            suggestActions();
        }
    } catch (error) {
        if (error.message.includes('1060')) {
            console.log('❌ MySQL服务未安装或服务名称不正确');
            console.log('请检查MySQL服务名称是否为"MySQL"');
        } else {
            console.log('❌ 检查服务时出错:');
            console.log(error.message);
        }
        suggestActions();
    }
}

function startWindowsMySQL() {
    console.log('\n正在尝试启动MySQL服务...');
    try {
        execSync('net start MySQL', { encoding: 'utf8' });
        console.log('✅ MySQL服务启动成功！');
        testConnection();
    } catch (error) {
        console.log('❌ 启动服务失败:');
        console.log(error.message);
        console.log('\n请尝试使用管理员权限运行以下命令:');
        console.log('  net start MySQL');
        suggestActions();
    }
}

function checkLinuxMySQL() {
    try {
        const output = execSync('systemctl status mysql 2>&1', { encoding: 'utf8' });
        
        if (output.includes('active (running)')) {
            console.log('✅ MySQL服务正在运行');
            testConnection();
        } else {
            console.log('❌ MySQL服务未运行');
            startLinuxMySQL();
        }
    } catch (error) {
        console.log('❌ 检查服务时出错:');
        console.log(error.message);
        suggestActions();
    }
}

function startLinuxMySQL() {
    console.log('\n正在尝试启动MySQL服务...');
    try {
        execSync('sudo systemctl start mysql', { encoding: 'utf8' });
        console.log('✅ MySQL服务启动成功！');
        testConnection();
    } catch (error) {
        console.log('❌ 启动服务失败:');
        console.log(error.message);
        console.log('\n请尝试使用以下命令:');
        console.log('  sudo systemctl start mysql');
        suggestActions();
    }
}

function testConnection() {
    console.log('\n正在测试数据库连接...');
    try {
        const { Sequelize } = require('sequelize');
        const sequelize = new Sequelize(
            'shopping_db',
            'root',
            '',
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
                console.log('  cd backend && npm start');
                process.exit(0);
            })
            .catch(err => {
                console.error('❌ 连接失败:', err.message);
                console.log('\n可能需要创建数据库:');
                console.log('  mysql -u root -e "CREATE DATABASE shopping_db;"');
                process.exit(1);
            });
    } catch (error) {
        console.error('❌ 测试连接时出错:', error.message);
        suggestActions();
    }
}

function suggestActions() {
    console.log('\n建议操作:');
    console.log('1. 确保MySQL已正确安装');
    console.log('2. 检查MySQL服务名称是否正确');
    console.log('3. 手动启动MySQL服务');
    console.log('4. 检查防火墙设置是否允许3306端口');
    
    if (platform === 'win32') {
        console.log('\nWindows用户:');
        console.log('  - 以管理员身份运行命令提示符');
        console.log('  - 运行: sc query MySQL (检查服务状态)');
        console.log('  - 运行: net start MySQL (启动服务)');
    } else {
        console.log('\nLinux用户:');
        console.log('  - 运行: systemctl status mysql (检查状态)');
        console.log('  - 运行: sudo systemctl start mysql (启动服务)');
    }
    
    process.exit(1);
}
