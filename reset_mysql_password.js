#!/usr/bin/env node

/**
 * MySQL密码重置脚本
 * 适用于Windows系统的MySQL 8.0+
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

console.log('MySQL密码重置脚本');
console.log('=' * 60);

// 检查是否以管理员身份运行
const isAdmin = () => {
    try {
        execSync('net session', { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

if (!isAdmin()) {
    console.error('❌ 请以管理员身份运行此脚本！');
    console.log('\n方法：');
    console.log('1. 右键点击"命令提示符"');
    console.log('2. 选择"以管理员身份运行"');
    console.log('3. 导航到项目目录：cd d:/trae/shopping web');
    console.log('4. 再次运行：node reset_mysql_password.js');
    process.exit(1);
}

// 密码设置
const NEW_PASSWORD = 'Czk241203';
const MYSQL_SERVICE = 'MySQL80';

console.log('重置密码为:', NEW_PASSWORD);
console.log('MySQL服务名称:', MYSQL_SERVICE);
console.log('=' * 60);

// 停止MySQL服务
console.log('\n1. 停止MySQL服务...');
try {
    execSync(`net stop ${MYSQL_SERVICE}`, { stdio: 'inherit' });
    console.log('✅ MySQL服务已停止');
} catch (err) {
    console.log('⚠️ MySQL服务可能已经停止');
}

// 创建临时配置文件
const TEMP_DIR = path.join(__dirname, 'temp_mysql_config');
const TEMP_MY_CNF = path.join(TEMP_DIR, 'my.cnf');

if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const configContent = `[mysqld]
skip-grant-tables
skip-networking
`;

fs.writeFileSync(TEMP_MY_CNF, configContent);
console.log('✅ 创建临时配置文件');

// 查找MySQL安装目录
let mysqlInstallDir = '';
try {
    const regQuery = execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\MySQL AB\\MySQL Server 8.0" /v Location', { encoding: 'utf8' });
    const match = regQuery.match(/Location\s+REG_SZ\s+([^\r\n]+)/);
    if (match && match[1]) {
        mysqlInstallDir = match[1];
        console.log('✅ 找到MySQL安装目录:', mysqlInstallDir);
    }
} catch (err) {
    console.error('❌ 无法找到MySQL安装目录');
    cleanup();
    process.exit(1);
}

const mysqldPath = path.join(mysqlInstallDir, 'bin', 'mysqld.exe');
const mysqlPath = path.join(mysqlInstallDir, 'bin', 'mysql.exe');

if (!fs.existsSync(mysqldPath)) {
    console.error('❌ 找不到mysqld.exe:', mysqldPath);
    cleanup();
    process.exit(1);
}

if (!fs.existsSync(mysqlPath)) {
    console.error('❌ 找不到mysql.exe:', mysqlPath);
    cleanup();
    process.exit(1);
}

console.log('✅ 验证MySQL可执行文件路径');

// 使用临时配置启动MySQL
console.log('\n2. 使用临时配置启动MySQL...');
const mysqldProcess = exec(`${mysqldPath} --defaults-file="${TEMP_MY_CNF}"`, (err) => {
    if (err) {
        console.error('❌ 启动MySQL失败:', err.message);
        cleanup();
        process.exit(1);
    }
});

// 等待MySQL启动
setTimeout(() => {
    try {
        console.log('\n3. 重置root密码...');
        
        // 重置密码
        const resetQuery = `ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_PASSWORD}'; FLUSH PRIVILEGES;`;
        execSync(`${mysqlPath} -u root mysql -e "${resetQuery}"`, { stdio: 'inherit' });
        
        console.log('✅ 密码重置成功！');
        
        // 停止临时MySQL进程
        console.log('\n4. 停止临时MySQL进程...');
        try {
            execSync('taskkill /F /IM mysqld.exe', { stdio: 'ignore' });
        } catch {
            // 进程可能已经结束
        }
        
        // 清理临时文件
        cleanup();
        
        // 重新启动MySQL服务
        console.log('\n5. 重新启动MySQL服务...');
        try {
            execSync(`net start ${MYSQL_SERVICE}`, { stdio: 'inherit' });
            console.log('✅ MySQL服务已启动');
        } catch (err) {
            console.error('❌ 启动MySQL服务失败:', err.message);
            process.exit(1);
        }
        
        // 测试新密码
        console.log('\n6. 测试新密码...');
        try {
            const testQuery = 'SELECT VERSION();';
            execSync(`${mysqlPath} -u root -p${NEW_PASSWORD} mysql -e "${testQuery}"`, { stdio: 'inherit' });
            console.log('✅ 密码测试成功！');
            
            // 更新.env文件
            updateEnvFiles(NEW_PASSWORD);
            
            console.log('\n🎉 密码重置完成！');
            console.log('=' * 60);
            console.log('新密码:', NEW_PASSWORD);
            console.log('请确保记住这个密码！');
            process.exit(0);
        } catch (err) {
            console.error('❌ 密码测试失败:', err.message);
            process.exit(1);
        }
        
    } catch (err) {
        console.error('❌ 重置密码失败:', err.message);
        cleanup();
        process.exit(1);
    }
}, 5000);

// 清理函数
function cleanup() {
    try {
        // 停止临时MySQL进程
        execSync('taskkill /F /IM mysqld.exe', { stdio: 'ignore' });
    } catch {
        // 进程可能已经结束
    }
    
    // 删除临时配置文件
    if (fs.existsSync(TEMP_MY_CNF)) {
        fs.unlinkSync(TEMP_MY_CNF);
    }
    
    if (fs.existsSync(TEMP_DIR)) {
        fs.rmdirSync(TEMP_DIR);
    }
    
    console.log('✅ 清理临时文件完成');
}

// 更新.env文件
function updateEnvFiles(password) {
    console.log('\n7. 更新.env配置文件...');
    
    const envFiles = [
        path.join(__dirname, '.env'),
        path.join(__dirname, 'backend', '.env')
    ];
    
    envFiles.forEach(filePath => {
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf8');
            content = content.replace(/DB_PASSWORD=.*$/m, `DB_PASSWORD=${password}`);
            fs.writeFileSync(filePath, content);
            console.log(`✅ 更新 ${path.relative(__dirname, filePath)}`);
        }
    });
}

// 捕获Ctrl+C
process.on('SIGINT', () => {
    console.log('\n\n🛑 脚本被中断');
    cleanup();
    process.exit(0);
});
