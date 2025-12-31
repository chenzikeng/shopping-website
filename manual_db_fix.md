# 手动修复数据库连接问题

如果修复脚本无法使用，您可以手动执行以下步骤来修复数据库连接问题：

## 步骤一：检查并更新.env文件中的数据库密码

1. 查看当前.env文件配置：
```bash
cat /home/shopping\ web/backend/.env
```

2. 如果密码不正确，更新.env文件：
```bash
nano /home/shopping\ web/backend/.env
```

确保DB_PASSWORD与您的MySQL root密码匹配：
```
DB_PASSWORD=your_mysql_root_password
```

## 步骤二：重新配置MySQL权限

1. 登录MySQL：
```bash
mysql -u root -p
```

2. 在MySQL命令行中执行以下命令：
```sql
-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS shopping_db;

-- 授予root用户对shopping_db的所有权限
GRANT ALL PRIVILEGES ON shopping_db.* TO 'root'@'localhost' WITH GRANT OPTION;

-- 刷新权限
FLUSH PRIVILEGES;

-- 退出MySQL
EXIT;
```

## 步骤三：验证数据库连接

1. 在backend目录下执行以下命令验证连接：
```bash
cd /home/shopping\ web/backend
node -e "require('dotenv').config(); const { Sequelize } = require('sequelize'); const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, { host: process.env.DB_HOST, dialect: 'mysql' }); sequelize.authenticate().then(() => console.log('连接成功!')).catch(err => console.error('连接失败:', err))"
```

## 步骤四：重启后端服务

1. 如果连接验证成功，重新启动后端服务：
```bash
cd /home/shopping\ web/backend
node server.js
```

## 重置MySQL root密码（如果忘记密码）

如果您忘记了MySQL root密码，可以按照以下步骤重置：

1. 停止MySQL服务：
```bash
systemctl stop mysql
```

2. 以跳过权限检查的方式启动MySQL：
```bash
mysqld_safe --skip-grant-tables &
```

3. 登录MySQL：
```bash
mysql -u root
```

4. 在MySQL命令行中重置密码：
```sql
FLUSH PRIVILEGES;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
EXIT;
```

5. 重启MySQL服务：
```bash
systemctl start mysql
```

6. 更新.env文件中的密码：
```bash
nano /home/shopping\ web/backend/.env
```

将DB_PASSWORD更新为新密码，然后重新启动后端服务。

## 步骤零：检查并启动MySQL服务

### Windows系统

1. **以管理员身份运行命令提示符**：
   - 右键点击"开始"菜单
   - 选择"Windows PowerShell (管理员)"或"命令提示符 (管理员)"

2. **检查MySQL服务状态**：
   ```bash
   sc query MySQL
   ```

3. **启动MySQL服务**：
   ```bash
   net start MySQL
   ```
   
   如果提示"系统错误 5"或"拒绝访问"，说明您没有以管理员身份运行命令提示符！

4. **设置MySQL服务开机自启**：
   ```bash
   sc config MySQL start= auto
   ```

### Linux系统

1. **检查MySQL服务状态**：
   ```bash
   sudo systemctl status mysql
   ```

2. **启动MySQL服务**：
   ```bash
   sudo systemctl start mysql
   ```

3. **设置MySQL服务开机自启**：
   ```bash
   sudo systemctl enable mysql
   ```

### 验证服务是否启动

启动服务后，您应该能看到类似以下信息：
- Windows: `MySQL 服务已经启动成功。`
- Linux: `Active: active (running)`

## 常见问题排查

1. **Access denied for user 'root'@'localhost'**
   - 检查.env文件中的DB_PASSWORD是否与MySQL root密码匹配
   - 确保root用户具有足够的权限
   - 确保MySQL服务正在运行

2. **Database 'shopping_db' does not exist**
   - 确保执行了CREATE DATABASE命令
   - 检查.env文件中的DB_NAME是否正确
   - 确保MySQL服务正在运行

3. **SequelizeConnectionError**
   - 确保MySQL服务正在运行
   - 检查数据库配置参数是否正确
   - 检查MySQL服务是否监听在正确的端口（默认3306）

如果问题仍然存在，请检查MySQL日志以获取更多信息：
```bash
tail -n 50 /var/log/mysql/error.log
```