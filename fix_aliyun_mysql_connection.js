// 阿里云服务器MySQL连接修复脚本
// 用于解决Access denied for user 'root'@'localhost'的问题

const fs = require('fs');
const path = require('path');

console.log('=== 阿里云MySQL连接修复脚本 ===\n');

// 1. 检查是否在阿里云服务器环境
const checkAliyunEnvironment = () => {
    try {
        const os = require('os');
        const hostname = os.hostname();
        console.log(`当前主机名: ${hostname}`);
        
        // 阿里云ECS的主机名通常包含特定格式
        if (hostname.includes('iZ') && hostname.includes('Z')) {
            console.log('✓ 检测到阿里云ECS服务器环境\n');
            return true;
        } else {
            console.log('⚠ 未检测到阿里云ECS服务器环境，此脚本主要用于阿里云环境\n');
            return false;
        }
    } catch (error) {
        console.log('⚠ 无法检测服务器环境\n');
        return false;
    }
};

// 2. 创建MySQL权限修复SQL脚本
const createFixSqlScript = () => {
    const sqlContent = `-- MySQL权限修复脚本
-- 修复root@localhost的访问权限问题

-- 选择MySQL系统数据库
USE mysql;

-- 检查当前用户配置
SELECT user, host, plugin FROM user WHERE user = 'root';

-- 设置root用户密码
ALTER USER 'root'@'localhost' IDENTIFIED BY 'Czk241203';

-- 允许root用户从所有主机访问（可选，仅用于开发环境）
-- ALTER USER 'root'@'%' IDENTIFIED BY 'Czk241203';

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出
EXIT;
`;
    
    fs.writeFileSync('/tmp/fix_mysql_permissions.sql', sqlContent);
    console.log('✓ 创建了MySQL权限修复SQL脚本: /tmp/fix_mysql_permissions.sql\n');
};

// 3. 创建修复执行脚本（shell）
const createFixShellScript = () => {
    const shellContent = `#!/bin/bash

# 阿里云MySQL连接修复脚本
echo "=== 阿里云MySQL连接修复脚本 ==="
echo

# 检查是否以root用户运行
if [ "$EUID" -ne 0 ]; then
    echo "错误: 请以root用户身份运行此脚本！"
    exit 1
fi

echo "1. 停止MySQL服务..."
systemctl stop mysql
sleep 2

echo "2. 以跳过权限检查的方式启动MySQL..."
mysqld_safe --skip-grant-tables &
sleep 5

echo "3. 执行权限修复SQL..."
mysql -u root < /tmp/fix_mysql_permissions.sql
sleep 2

echo "4. 停止临时MySQL进程..."
killall mysqld
sleep 2

echo "5. 重新启动MySQL服务..."
systemctl start mysql
sleep 2

echo "6. 验证MySQL服务状态..."
systemctl status mysql --no-pager | head -20

echo

# 检查数据库连接
echo "7. 测试数据库连接..."
mysql -u root -pCzk241203 -e "SELECT DATABASE();" shopping_db

if [ $? -eq 0 ]; then
    echo "✓ 数据库连接成功！"
else
    echo "✗ 数据库连接失败！"
fi

echo

echo "=== 修复完成 ==="
echo "请在后端目录下检查.env文件中的DB_PASSWORD是否设置为Czk241203"
echo "然后重新启动后端服务: node server.js"
`;
    
    fs.writeFileSync('/tmp/fix_mysql_connection.sh', shellContent);
    fs.chmodSync('/tmp/fix_mysql_connection.sh', '755');
    console.log('✓ 创建了修复执行脚本: /tmp/fix_mysql_connection.sh\n');
};

// 4. 创建.env文件验证脚本
const createEnvCheckScript = () => {
    const envCheckContent = `#!/bin/bash

echo "=== 检查后端环境变量配置 ==="

echo "\n1. 查看当前目录:"
pwd

echo "\n2. 检查.env文件是否存在:"
if [ -f ".env" ]; then
    echo "✓ .env文件存在"
    echo "\n3. 显示数据库配置:"
    grep -E "DB_|PORT" .env
else
    echo "✗ .env文件不存在，请创建！"
    echo "\n4. 创建默认.env文件..."
    cat > .env << EOF
# 数据库配置
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=Czk241203
DB_NAME=shopping_db

# JWT配置
JWT_SECRET=IYUMbExDoc7EShyaxbslk+cNsb+AN79CQCLrzAoHb1w=

# 邮件配置
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

# 服务器配置
PORT=3000
EOF
    echo "✓ 默认.env文件已创建"
fi

echo "\n=== 检查完成 ==="
`;
    
    fs.writeFileSync('/tmp/check_env_config.sh', envCheckContent);
    fs.chmodSync('/tmp/check_env_config.sh', '755');
    console.log('✓ 创建了环境变量检查脚本: /tmp/check_env_config.sh\n');
};

// 5. 生成使用说明
const generateUsageInstructions = () => {
    const instructions = `
=== 阿里云MySQL连接修复使用说明 ===

【问题分析】
从错误信息 "ER_ACCESS_DENIED_NO_PASSWORD_ERROR" 可知，MySQL root用户在localhost访问时没有提供正确的密码，或者密码配置为空。

【修复步骤】

1. 在阿里云服务器上执行以下操作：

   # 上传脚本到服务器
   scp fix_aliyun_mysql_connection.js root@your_server_ip:/root/
   
   # 登录服务器
   ssh root@your_server_ip
   
   # 运行此脚本生成修复文件
   node fix_aliyun_mysql_connection.js
   
   # 执行修复（需要root权限）
   bash /tmp/fix_mysql_connection.sh
   
   # 进入后端目录检查环境变量
   cd /home/shopping\ web/backend
   bash /tmp/check_env_config.sh
   
   # 重新启动后端服务
   node server.js

2. 如果问题仍然存在，请检查：
   - MySQL服务是否正常运行
   - .env文件中的密码是否为Czk241203
   - 数据库shopping_db是否已创建

3. 额外排查命令：
   # 检查MySQL进程
   ps aux | grep mysql
   
   # 检查MySQL日志
   cat /var/log/mysql/error.log | tail -50
   
   # 手动测试数据库连接
   mysql -u root -pCzk241203 -e "USE shopping_db; SELECT 1;"

=== 修复脚本生成完成 ===
`;
    
    console.log(instructions);
};

// 主程序
try {
    checkAliyunEnvironment();
    createFixSqlScript();
    createFixShellScript();
    createEnvCheckScript();
    generateUsageInstructions();
    console.log('所有修复脚本已生成完成！请按照使用说明在阿里云服务器上执行。');
} catch (error) {
    console.error('生成修复脚本时出错:', error);
    process.exit(1);
}
