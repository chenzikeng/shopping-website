#!/bin/bash

echo "测试注册功能..."
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"测试用户","email":"test@example.com","password":"testpassword","phone":"13800138000","address":"测试地址"}'

echo -e "\n\n测试登录功能..."
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpassword"}'

echo -e "\n\n测试完成"