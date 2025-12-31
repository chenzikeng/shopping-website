#!/bin/bash
# 恢复服务器到正常工作状态

# 1. 检查并创建正确的目录结构
if [ ! -d "/home/shopping web/backend" ]; then
    echo "创建backend目录..."
    mkdir -p "/home/shopping web/backend"
fi

# 2. 上传文件
echo "上传server.js文件..."
scp -o "StrictHostKeyChecking=no" "d:/trae/shopping web/backend/server.js" root@8.148.199.180:"/home/shopping web/backend/"

# 3. 上传其他必要文件
echo "上传配置文件..."
scp -o "StrictHostKeyChecking=no" "d:/trae/shopping web/backend/package.json" root@8.148.199.180:"/home/shopping web/backend/"
scp -o "StrictHostKeyChecking=no" "d:/trae/shopping web/backend/.env" root@8.148.199.180:"/home/shopping web/backend/"

# 4. 设置正确的权限
echo "设置文件权限..."
ssh root@8.148.199.180 'chmod -R 755 "/home/shopping web/backend"'

# 5. 启动服务器
echo "启动服务器..."
ssh root@8.148.199.180 'cd "/home/shopping web/backend" && nohup node server.js > /tmp/server.log 2>&1 &'

# 6. 检查服务器状态
echo "检查服务器状态..."
sleep 3
ssh root@8.148.199.180 'ps aux | grep node'
ssh root@8.148.199.180 'cat /tmp/server.log'