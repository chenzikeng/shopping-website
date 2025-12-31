# Nginx前端配置修复指南

## 问题诊断
- 前端文件位置：`/home/shopping web/frontend/`
- Nginx当前配置：`/var/www/html`
- 问题：Nginx在错误的目录中查找前端文件

## 修复步骤

### 1. 创建新的Nginx配置文件
```bash
# 创建配置文件
sudo nano /etc/nginx/sites-available/shopping-web
```

### 2. 添加配置内容
```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    root /home/shopping web/frontend;
    index index.html index.htm;
    
    server_name _;
    
    # 前端静态文件
    location / {
        try_files $uri $uri/ =404;
    }
    
    # 前端页面路径
    location /frontend/ {
        alias /home/shopping web/frontend/;
        try_files $uri $uri/ =404;
    }
    
    # API代理到后端
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 启用配置并重启Nginx
```bash
# 删除默认配置链接
sudo rm /etc/nginx/sites-enabled/default

# 启用新配置
sudo ln -s /etc/nginx/sites-available/shopping-web /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

### 4. 设置正确的文件权限
```bash
# 设置目录权限
sudo chown -R root:root /home/shopping web/frontend/
sudo chmod -R 755 /home/shopping web/frontend/

# 确保nginx可以访问
sudo usermod -a -G www-data root
```

## 验证修复
1. 访问：`http://8.148.199.180/index.html`
2. 访问：`http://8.148.199.180/frontend/index.html`
3. 访问：`http://8.148.199.180/frontend/email.html`

## 替代方案：直接修改默认配置
如果不想创建新文件，也可以直接修改默认配置：

```bash
# 编辑默认配置
sudo nano /etc/nginx/sites-enabled/default

# 将 root /var/www/html; 改为
root /home/shopping web/frontend;

# 保存并重启
sudo systemctl reload nginx
```