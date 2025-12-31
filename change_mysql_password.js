#!/usr/bin/env node

/**
 * MySQL密码更改工具
 * 适用于Windows系统
 * 用法: node change_mysql_password.js new_password
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

console.log('MySQL密码更改工具');
console.log('=' * 50);

// 检查是否以管理员身份运行
function isAdmin() {
    try {
        execSync('net session', { stdio: 'ignore' });
        return true;
    } catch (error) {
        return false;
    }
}

if (!isAdmin()) {
    console.error('❌ 错误: 请以管理员身份运行此脚本');
    console.log('\n操作方法:');
    console.log('1. 右键点击"命令提示符"或"PowerShell"');
    console.log('2. 选择"以管理员身份运行"');
    console.log('3. 然后运行此脚本');
    process.exit(1);
}

// 获取新密码
const newPassword = process.argv[2];
if (!newPassword) {
    console.error('❌ 错误: 请提供新密码');
    console.log('用法: node change_mysql_password.js new_password');
    process.exit(1);
}

console.log(`\n要设置的新密码: ${newPassword}`);
console.log('=' * 50);

// 检查MySQL服务状态
console.log('检查MySQL服务状态...');
let serviceName = 'MySQL';
try {
    const result = execSync('sc query MySQL', { encoding: 'utf8' });
    if (result.includes('RUNNING')) {
        console.log(`✅ ${serviceName}服务正在运行`);
    } else {
        // 尝试其他常见服务名称
        const serviceNames = ['MySQL57', 'MySQL80', 'mysql'];
        for (const name of serviceNames) {
            try {
                const result = execSync(`sc query ${name}`, { encoding: 'utf8' });
                if (result.includes('RUNNING')) {
                    serviceName = name;
                    console.log(`✅ ${serviceName}服务正在运行`);
                    break;
                }
            } catch (e) {
                // 忽略错误
            }
        }
    }
} catch (error) {
    console.error('❌ 未找到MySQL服务');
    console.log('请检查MySQL是否已安装');
    process.exit(1);
}

// 停止MySQL服务
console.log(`\n停止${serviceName}服务...`);
try {
    execSync(`net stop ${serviceName}`, { encoding: 'utf8', stdio: 'inherit' });
    console.log('✅ 服务已停止');
} catch (error) {
    console.error('❌ 停止服务失败');
    console.log('错误信息:', error.message);
    process.exit(1);
}

// 创建临时配置文件以跳过权限检查
const tempMyIni = path.join(__dirname, 'my_temp.ini');
const tempMyIniContent = `[mysqld]
skip-grant-tables
skip-networking
`;

fs.writeFileSync(tempMyIni, tempMyIniContent);
console.log(`\n创建临时配置文件: ${tempMyIni}`);

// 找到MySQL安装目录
let mysqlBinPath = '';
try {
    const registryOutput = execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\MySQL AB\\MySQL Server 8.0" /v Location', { encoding: 'utf8' });
    const pathMatch = registryOutput.match(/Location\s+REG_SZ\s+(.*)/);
    if (pathMatch) {
        mysqlBinPath = path.join(pathMatch[1], 'bin');
    }
} catch (e) {
    // 尝试其他注册表路径
    try {
        const registryOutput = execSync('reg query "HKEY_LOCAL_MACHINE\\SOFTWARE\\MySQL\\MySQL Server 8.0" /v Location', { encoding: 'utf8' });
        const pathMatch = registryOutput.match(/Location\s+REG_SZ\s+(.*)/);
        if (pathMatch) {
            mysqlBinPath = path.join(pathMatch[1], 'bin');
        }
    } catch (e2) {
        // 尝试常见安装路径
        const commonPaths = [
            'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin',
            'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin',
            'C:\\Program Files\\MySQL\\MySQL Server 5.7\\bin'
        ];
        
        for (const p of commonPaths) {
            if (fs.existsSync(path.join(p, 'mysqld.exe'))) {
                mysqlBinPath = p;
                break;
            }
        }
    }
}

if (!mysqlBinPath || !fs.existsSync(path.join(mysqlBinPath, 'mysqld.exe'))) {
    console.error('❌ 未找到MySQL安装目录');
    console.log('请手动指定MySQL的bin目录');
    fs.unlinkSync(tempMyIni);
    process.exit(1);
}

console.log(`找到MySQL bin目录: ${mysqlBinPath}`);

// 使用临时配置启动MySQL
console.log('\n使用临时配置启动MySQL...');
const mysqldPath = path.join(mysqlBinPath, 'mysqld.exe');
const mysqlPath = path.join(mysqlBinPath, 'mysql.exe');

let mysqldProcess = null;
try {
    mysqldProcess = exec(`${mysqldPath} --defaults-file="${tempMyIni}"`, { 
        stdio: 'ignore',
        detached: true
    });
    
    // 等待MySQL启动
    console.log('等待MySQL启动...');
    for (let i = 0; i < 10; i++) {
        try {
            execSync(`${mysqlPath} -u root -e "SELECT 1"`, { encoding: 'utf8', stdio: 'ignore' });
            console.log('✅ MySQL已启动');
            break;
        } catch (e) {
            if (i === 9) {
                throw new Error('MySQL启动超时');
            }
            console.log('等待中...');
            require('child_process').execSync('timeout /t 1 /nobreak > NUL');
        }
    }
} catch (error) {
    console.error('❌ 启动MySQL失败');
    console.log('错误信息:', error.message);
    if (mysqldProcess) {
        try {
            execSync('taskkill /F /IM mysqld.exe', { stdio: 'ignore' });
        } catch (e) {
            // 忽略错误
        }
    }
    fs.unlinkSync(tempMyIni);
    process.exit(1);
}

// 更新root密码
console.log('\n更新root用户密码...');
try {
    // 对于MySQL 5.7及以上版本
    execSync(`${mysqlPath} -u root -e "ALTER USER 'root'@'localhost' IDENTIFIED BY '${newPassword}'; FLUSH PRIVILEGES;"`, { 
        encoding: 'utf8',
        stdio: 'inherit'
    });
    console.log('✅ 密码更新成功');
} catch (error) {
    try {
        // 尝试旧版本的密码更新方式
        execSync(`${mysqlPath} -u root -e "UPDATE mysql.user SET authentication_string=PASSWORD('${newPassword}') WHERE User='root' AND Host='localhost'; FLUSH PRIVILEGES;"`, { 
            encoding: 'utf8',
            stdio: 'inherit'
        });
        console.log('✅ 密码更新成功');
    } catch (error2) {
        console.error('❌ 更新密码失败');
        console.log('错误信息:', error2.message);
        
        // 清理
        if (mysqldProcess) {
            try {
                execSync('taskkill /F /IM mysqld.exe', { stdio: 'ignore' });
            } catch (e) {
                // 忽略错误
            }
        }
        fs.unlinkSync(tempMyIni);
        process.exit(1);
    }
}

// 停止临时MySQL进程
console.log('\n停止临时MySQL进程...');
try {
    execSync('taskkill /F /IM mysqld.exe', { stdio: 'ignore' });
    console.log('✅ 临时进程已停止');
} catch (error) {
    console.error('❌ 停止临时进程失败');
    console.log('可能需要手动终止mysqld.exe进程');
}

// 删除临时配置文件
fs.unlinkSync(tempMyIni);
console.log('✅ 临时配置文件已删除');

// 重启MySQL服务
console.log(`\n重启${serviceName}服务...`);
try {
    execSync(`net start ${serviceName}`, { encoding: 'utf8', stdio: 'inherit' });
    console.log('✅ 服务已重启');
} catch (error) {
    console.error('❌ 重启服务失败');
    console.log('错误信息:', error.message);
    process.exit(1);
}

// 测试新密码
console.log('\n测试新密码...');
try {
    execSync(`${mysqlPath} -u root -p${newPassword} -e "SELECT 1"`, { 
        encoding: 'utf8',
        stdio: 'ignore'
    });
    console.log('✅ 新密码测试成功');
} catch (error) {
    console.error('❌ 新密码测试失败');
    console.log('错误信息:', error.message);
    process.exit(1);
}

// 更新项目配置
console.log('\n更新项目配置文件...');
const projectEnvPath = path.join(__dirname, '.env');
const backendEnvPath = path.join(__dirname, 'backend', '.env');

if (fs.existsSync(projectEnvPath)) {
    let projectEnvContent = fs.readFileSync(projectEnvPath, 'utf8');
    projectEnvContent = projectEnvContent.replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${newPassword}`);
    fs.writeFileSync(projectEnvPath, projectEnvContent);
    console.log(`✅ 更新成功: ${path.basename(projectEnvPath)}`);
}

if (fs.existsSync(backendEnvPath)) {
    let backendEnvContent = fs.readFileSync(backendEnvPath, 'utf8');
    backendEnvContent = backendEnvContent.replace(/DB_PASSWORD=.*/g, `DB_PASSWORD=${newPassword}`);
    fs.writeFileSync(backendEnvPath, backendEnvContent);
    console.log(`✅ 更新成功: ${path.join('backend', path.basename(backendEnvPath))}`);
}

console.log('\n' + '=' * 50);
console.log('🎉 密码更改完成！');
console.log('=' * 50);
console.log(`新密码: ${newPassword}`);
console.log('\n后续步骤:');
console.log('1. 启动后端服务: cd backend && node server.js');
console.log('2. 测试应用功能');
console.log('\n注意: 请妥善保存新密码');
