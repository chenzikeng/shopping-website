# MySQL密码更改指南

## 为什么需要更改密码？
- 提高数据库安全性
- 忘记当前密码
- 统一密码管理

## 如何使用自动化工具

### 步骤1：以管理员身份运行命令提示符
1. 按下 `Win + X` 键
2. 选择 `命令提示符（管理员）` 或 `Windows PowerShell（管理员）`

### 步骤2：运行密码更改工具

在管理员命令提示符中，执行以下命令：

```bash
cd d:/trae/shopping web
node change_mysql_password.js 新密码
```

**示例：** 如果要将密码设置为 `MyNewPassword123`，执行：

```bash
cd d:/trae/shopping web
node change_mysql_password.js MyNewPassword123
```

## 脚本功能说明

自动化工具会执行以下操作：

1. **检查管理员权限** - 确保以管理员身份运行
2. **验证MySQL服务** - 检查MySQL是否已安装并运行
3. **停止MySQL服务** - 为了安全地更改密码
4. **创建临时配置** - 跳过权限检查以重置密码
5. **启动临时MySQL** - 使用特殊配置启动
6. **更新root密码** - 设置新的密码
7. **清理临时文件** - 移除安全风险
8. **重启MySQL服务** - 恢复正常运行
9. **测试新密码** - 验证密码是否生效
10. **更新项目配置** - 自动更新项目的.env文件

## 手动更改密码（备选方案）

如果自动化工具无法正常工作，可以尝试手动更改：

### 方法1：使用mysqladmin命令

```bash
mysqladmin -u root -p旧密码 password 新密码
```

### 方法2：通过MySQL命令行

1. 登录MySQL：
   ```bash
   mysql -u root -p
   ```

2. 在MySQL命令行中执行：
   ```sql
   -- MySQL 5.7及以上版本
   ALTER USER 'root'@'localhost' IDENTIFIED BY '新密码';
   FLUSH PRIVILEGES;

   -- MySQL 5.6及以下版本
   SET PASSWORD FOR 'root'@'localhost' = PASSWORD('新密码');
   FLUSH PRIVILEGES;
   ```

## 更新项目配置

密码更改后，需要更新项目的配置文件：

1. 更新根目录的 `.env` 文件
2. 更新 `backend/.env` 文件

确保 `DB_PASSWORD` 字段设置为新的MySQL密码。

## 验证更改

更改密码后，可以运行以下命令验证：

```bash
node test_mysql_password.js 新密码
```

## 常见问题

### 问题1：脚本提示"请以管理员身份运行"
**解决方案**：右键点击命令提示符，选择"以管理员身份运行"。

### 问题2：MySQL服务无法启动
**解决方案**：检查MySQL服务是否正确安装，尝试重新安装或修复MySQL。

### 问题3：密码更改后连接失败
**解决方案**：
1. 检查新密码是否正确
2. 确保MySQL服务正在运行
3. 验证项目配置文件中的密码是否已更新

## 安全提示

1. 密码应包含：
   - 至少8个字符
   - 大小写字母
   - 数字
   - 特殊字符

2. 不要使用：
   - 生日或电话号码
   - 简单的单词（如password）
   - 连续字符（如123456）

3. 定期更改密码
4. 不要在公共场合分享密码

## 联系支持

如果遇到任何问题，请参考项目文档或联系技术支持。
