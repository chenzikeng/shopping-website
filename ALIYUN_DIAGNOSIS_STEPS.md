# 阿里云服务器数据库连接诊断步骤

以下是完整的诊断步骤和对应的命令，您可以直接复制粘贴执行：

## 步骤1：上传诊断脚本到阿里云服务器

**在本地Windows命令行执行**：
```bash
# 确保您在项目根目录
cd d:/trae/shopping web

# 上传诊断脚本到服务器
scp backend/server_with_diagnostics.js root@8.148.199.180:/home/shopping web/backend/
scp backend/test_db_connection.js root@您的服务器IP:/home/shopping web/backend/
```

## 步骤2：登录阿里云服务器并切换到backend目录

**在本地Windows命令行执行**：
```bash
# 登录阿里云服务器
ssh root@您的服务器IP

# 切换到backend目录
cd /home/shopping web/backend
```

## 步骤3：检查.env文件配置是否正确

**在服务器端Linux命令行执行**：
```bash
# 查看.env文件内容
cat .env

# 确认配置是否正确（特别是数据库连接部分）
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=Czk241203
# DB_NAME=shopping_db
```

## 步骤4：运行诊断脚本查看详细输出

**在服务器端Linux命令行执行**：
```bash
# 运行详细诊断脚本
node server_with_diagnostics.js

# 或运行简单连接测试
node test_db_connection.js
```

## 步骤5：根据输出结果进行修复

根据诊断脚本的输出，选择以下相应的解决方案：

### 方案A：MySQL服务未启动
```bash
# 启动MySQL服务
sudo systemctl start mysql

# 设置MySQL开机自启
sudo systemctl enable mysql

# 检查MySQL服务状态
sudo systemctl status mysql
```

### 方案B：数据库不存在
```bash
# 创建数据库
mysql -u root -pCzk241203 -e "CREATE DATABASE IF NOT EXISTS shopping_db;"

# 验证数据库是否创建成功
mysql -u root -pCzk241203 -e "SHOW DATABASES;"
```

### 方案C：密码错误或权限问题
```bash
# 重置MySQL root密码
mysql -u root -pCzk241203 -e "ALTER USER 'root'@'localhost' IDENTIFIED BY 'Czk241203'; FLUSH PRIVILEGES;"

# 授予所有权限
mysql -u root -pCzk241203 -e "GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' WITH GRANT OPTION; FLUSH PRIVILEGES;"

# 验证密码是否正确
mysql -u root -pCzk241203 -e "USE shopping_db; SELECT 1;"
```

### 方案D：环境变量未加载
```bash
# 检查.env文件是否存在
ls -la .env

# 安装dotenv包（如果未安装）
npm install dotenv
```

## 步骤6：重新测试连接

**在服务器端Linux命令行执行**：
```bash
# 再次运行诊断脚本
node server_with_diagnostics.js

# 或直接启动服务器
node server.js
```

## 紧急修复脚本

如果以上步骤都无法解决问题，可以尝试运行以下完整修复脚本：

**在服务器端Linux命令行执行**：
```bash
#!/bin/bash

# 完整修复脚本
echo "=== 开始修复数据库连接问题 ==="

# 启动MySQL服务
echo "1. 启动MySQL服务..."
sudo systemctl start mysql

# 等待MySQL启动
sleep 2

# 创建数据库
echo "2. 创建数据库..."
mysql -u root -pCzk241203 -e "CREATE DATABASE IF NOT EXISTS shopping_db;"

# 设置权限
echo "3. 设置数据库权限..."
mysql -u root -pCzk241203 -e "GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' WITH GRANT OPTION; FLUSH PRIVILEGES;"

# 验证连接
echo "4. 验证数据库连接..."
mysql -u root -pCzk241203 -e "USE shopping_db; SELECT '连接成功' AS 状态;"

# 安装依赖
echo "5. 安装Node.js依赖..."
npm install

# 运行诊断脚本
echo "6. 运行诊断脚本..."
node server_with_diagnostics.js

echo "=== 修复完成 ==="
```

将以上内容保存为`fix_database.sh`，然后执行：
```bash
chmod +x fix_database.sh
./fix_database.sh
```

## 注意事项

1. 所有命令中的`您的服务器IP`需要替换为实际的阿里云服务器IP地址
2. 执行命令时请注意区分本地Windows命令和服务器Linux命令
3. 如果提示输入密码，输入您的服务器root密码
4. 第一次登录服务器时可能需要确认服务器指纹，输入"yes"即可
5. 如果使用SSH密钥登录，可以省略密码输入步骤
