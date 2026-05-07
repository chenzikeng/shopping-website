# 在线购物网站课程项目

姓名：陈子铿  
学号：202330452641  
项目类型：电子商务网站（购物类）  
课程：网络应用架构设计与开发

本项目是一个基于 `Node.js + Express + MySQL + Sequelize` 的在线购物网站系统，在基础购物网站功能之上，进一步实现了课程要求中的三类用户角色、商品订购、销售管理、用户行为采集、大数据分析、推荐系统、销售趋势预测、销售异常监控、销售排行榜、多语言切换以及阿里云部署。

## 在线访问

线上部署地址：

```text
http://8.148.199.180
```

如果服务器暂未配置 80 端口代理，也可以访问：

```text
http://8.148.199.180:3000
```

管理员测试账号：

```text
邮箱：admin@example.com
密码：admin123
```

普通用户可以在注册页面自行注册。销售人员账号由管理员在后台“销售人员”页面创建。

## 代码托管

```text
https://github.com/chenzikeng/shopping-website.git
```

## 功能概览

### 顾客 Customer

- 新用户注册
- 注册用户登录、注销
- 未登录用户浏览商品
- 商品列表展示
- 商品搜索
- 商品类别筛选
- 推荐商品展示
- 加入购物车
- 修改购物车商品数量
- 删除购物车商品
- 填写收货信息并提交订单
- 模拟支付订单
- 查看我的订单
- 订单邮件确认
- 多语言切换

### 销售人员 Sales

- 商品类别管理
- 添加商品类别
- 删除商品类别
- 商品价格维护
- 商品库存维护
- 销售状态监控
- 用户登录日志查看
- 用户浏览日志查看
- 商品销售排行榜查看
- 销售趋势与异常预警查看

### 管理员 Admin

- 商品管理
- 订单管理
- 销售人员 ID 管理
- 添加销售人员
- 删除销售人员
- 重置销售人员密码
- 销售业绩查询
- 销售统计报表
- 销售趋势图
- 销售趋势预测
- 销售异常监控
- 操作日志审计

## 大数据采集与分析功能

项目实现了课程要求中的数据采集和分析功能。

### 用户数据采集

| 数据类型 | 采集内容 |
| --- | --- |
| 登录信息 | 登录时间、邮箱、角色、IP 地址、登录是否成功 |
| 浏览行为 | 商品 ID、商品类别、停留时长、IP 地址 |
| 购买记录 | 商品类别、购买日期、单价、数量、订单金额 |

### 销售人员与管理员数据采集

| 数据类型 | 采集内容 |
| --- | --- |
| 登录信息 | 时间、账号、角色、IP 地址 |
| 操作日志 | 操作时间、操作内容、IP、账号、角色 |

### 数据分析功能

- 用户画像
  - 地域分析
  - 购买力等级分析
  - 偏好商品类别分析
  - 总消费金额统计
  - 订单数量统计
- 商品推荐系统
  - 基于同订单共现商品推荐
  - 基于同类别商品推荐
  - 基于热销商品兜底推荐
- 商品销售趋势预测
  - 基于历史销售均值
  - 基于近期销售加权均值
  - 输出下一日预测销售额和评估结果
- 销售异常判别与实时监控
  - 低库存预警
  - 待付款订单数量预警
  - 近 7 日取消率预警
- 商品销售排行榜
  - 按销量排行
  - 展示销售数量和销售金额
- 销售趋势图
  - 支持按日、周、月统计
  - 使用 Chart.js 绘制趋势图

## 多语言功能

网站支持六种语言切换：

- 中文
- English
- Français
- Español
- 日本語
- 한국어

语言选择会保存在浏览器 `localStorage` 中，刷新页面后仍保持用户上次选择。

多语言脚本：

```text
frontend/js/i18n.js
```

## 技术栈

### 前端

- HTML5
- CSS3
- JavaScript
- Chart.js
- localStorage

### 后端

- Node.js
- Express
- Sequelize ORM
- JWT
- bcrypt
- nodemailer
- cors
- dotenv

### 数据库

- MySQL

### 部署与运维

- 阿里云 ECS
- Ubuntu
- Git
- npm
- PM2
- Nginx
- 阿里云安全组

## 项目结构

```text
shopping-web/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   ├── OrderItem.js
│   │   ├── LoginLog.js
│   │   ├── BrowseLog.js
│   │   ├── OperationLog.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   ├── analytics.js
│   │   ├── management.js
│   │   └── email.js
│   ├── services/
│   │   └── emailService.js
│   └── server.js
├── frontend/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── auth.js
│   │   ├── common.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   ├── admin.js
│   │   ├── admin-orders.js
│   │   ├── admin-reports.js
│   │   ├── admin-sales.js
│   │   └── i18n.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── cart.html
│   ├── orders.html
│   ├── admin.html
│   ├── admin-orders.html
│   ├── admin-reports.html
│   └── admin-sales.html
├── .env.example
├── package.json
└── README.md
```

## 核心页面

| 页面 | 说明 |
| --- | --- |
| `/` 或 `/index.html` | 首页，商品展示、类别筛选、猜你喜欢 |
| `/login.html` | 登录页面 |
| `/register.html` | 注册页面 |
| `/cart.html` | 我的购物车 |
| `/orders.html` | 我的订单 |
| `/admin.html` | 商品管理 |
| `/admin-orders.html` | 订单管理 |
| `/admin-reports.html` | 销售报表、趋势图、预测、异常监控、排行榜 |
| `/admin-sales.html` | 销售人员管理、操作日志 |

## 数据库表说明

| 表名 | 说明 |
| --- | --- |
| Users | 用户表，包含顾客、销售人员、管理员三类角色 |
| Products | 商品表 |
| Categories | 商品类别表 |
| Carts | 购物车表 |
| Orders | 订单表 |
| OrderItems | 订单明细表 |
| LoginLogs | 登录日志表 |
| BrowseLogs | 浏览日志表 |
| OperationLogs | 操作日志表 |

## 主要 API

### 认证接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/auth/register` | 用户注册 |
| POST | `/api/auth/login` | 用户登录 |
| GET | `/api/auth/me` | 获取当前用户信息 |
| PUT | `/api/auth/me` | 更新用户信息 |
| PUT | `/api/auth/change-password` | 修改密码 |

### 商品接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/products` | 获取商品列表 |
| GET | `/api/products/:id` | 获取商品详情 |
| GET | `/api/products/search/:keyword` | 搜索商品 |

### 购物车接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/cart` | 获取购物车 |
| POST | `/api/cart/add` | 添加商品到购物车 |
| PUT | `/api/cart/update/:id` | 修改购物车数量 |
| DELETE | `/api/cart/remove/:id` | 删除购物车商品 |

### 订单接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/orders` | 获取我的订单 |
| POST | `/api/orders` | 创建订单 |
| GET | `/api/orders/:id` | 获取订单详情 |
| POST | `/api/orders/:id/pay` | 支付订单 |
| POST | `/api/orders/:id/ship` | 管理员发货 |

### 管理接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/api/management/categories` | 获取商品类别 |
| POST | `/api/management/categories` | 添加商品类别 |
| DELETE | `/api/management/categories/:id` | 删除商品类别 |
| GET | `/api/management/sales-users` | 获取销售人员列表 |
| POST | `/api/management/sales-users` | 添加销售人员 |
| DELETE | `/api/management/sales-users/:id` | 删除销售人员 |
| PUT | `/api/management/sales-users/:id/reset-password` | 重置销售人员密码 |
| GET | `/api/management/logs/login` | 登录日志 |
| GET | `/api/management/logs/browse` | 浏览日志 |
| GET | `/api/management/logs/operations` | 操作日志 |

### 数据分析接口

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/analytics/browse` | 记录浏览行为 |
| GET | `/api/analytics/recommendations` | 获取推荐商品 |
| GET | `/api/analytics/profile` | 获取用户画像 |
| GET | `/api/analytics/sales-trends` | 销售趋势统计 |
| GET | `/api/analytics/leaderboard` | 商品销售排行榜 |
| GET | `/api/analytics/monitor` | 销售异常监控 |
| GET | `/api/analytics/forecast` | 销售趋势预测 |

## 本地运行

### 1. 安装环境

需要提前安装：

- Node.js 16+
- npm
- MySQL 5.7+ 或 MySQL 8+

### 2. 克隆项目

```bash
git clone https://github.com/chenzikeng/shopping-website.git
cd shopping-website
```

如果本地目录有空格，请进入实际项目路径，例如：

```bash
cd "d:\trae\shopping web"
```

### 3. 安装依赖

```bash
npm install
```

### 4. 配置环境变量

复制模板：

```bash
cp .env.example .env
```

Windows PowerShell 可以使用：

```powershell
Copy-Item .env.example .env
```

编辑 `.env`：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=shopping_db

PORT=3000
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your_email@example.com
EMAIL_PASSWORD=your_email_password

FRONTEND_URL=http://localhost:3000
```

### 5. 创建数据库

登录 MySQL：

```bash
mysql -u root -p
```

执行：

```sql
CREATE DATABASE IF NOT EXISTS shopping_db;
```

如果已有旧版本数据库，建议确保 `Users.role` 支持三种角色：

```sql
USE shopping_db;
ALTER TABLE Users MODIFY COLUMN role ENUM('customer', 'sales', 'admin') DEFAULT 'customer';
```

首次运行时，Sequelize 会自动同步创建数据表。

### 6. 启动项目

```bash
npm start
```

开发模式：

```bash
npm run dev
```

访问：

```text
http://localhost:3000
```

健康检查：

```text
http://localhost:3000/api
```

正常返回：

```json
{"message":"购物网站后端API正在运行"}
```

## 阿里云部署步骤

### 1. 服务器拉取代码

```bash
cd /home
git clone https://github.com/chenzikeng/shopping-website.git "shopping web"
cd "/home/shopping web"
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置 `.env`

```bash
cp .env.example .env
nano .env
```

根据服务器 MySQL 配置修改：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_server_mysql_password
DB_NAME=shopping_db
PORT=3000
JWT_SECRET=your_jwt_secret
```

### 4. 启动并守护后端

推荐使用 PM2：

```bash
npm install -g pm2
pm2 start npm --name shopping-web -- start
pm2 save
pm2 startup
```

查看状态：

```bash
pm2 status
```

如果显示 `shopping-web online`，说明后端正在运行。

### 5. 配置 Nginx 反向代理

安装 Nginx：

```bash
apt update
apt install nginx -y
```

创建配置：

```bash
nano /etc/nginx/sites-available/shopping-web
```

写入：

```nginx
server {
    listen 80 default_server;
    server_name 8.148.199.180 _;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：

```bash
ln -sf /etc/nginx/sites-available/shopping-web /etc/nginx/sites-enabled/shopping-web
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 6. 阿里云安全组

入方向规则建议开放：

| 端口 | 协议 | 授权对象 | 说明 |
| --- | --- | --- | --- |
| 22 | TCP | 0.0.0.0/0 | SSH 远程登录 |
| 80 | TCP | 0.0.0.0/0 | HTTP 网站访问 |
| 3000 | TCP | 0.0.0.0/0 | Node 后端访问 |

### 7. 线上验证

服务器内部测试：

```bash
curl http://localhost:3000/api
curl http://localhost/api
```

浏览器访问：

```text
http://8.148.199.180
```

## 常见问题

### 1. 浏览器出现 502

通常是后端没有运行或 Nginx 没有代理成功。

检查：

```bash
pm2 status
curl http://localhost:3000/api
systemctl status nginx
```

### 2. 访问 `8.148.199.180` 超时

检查安全组是否开放 80 端口，或者 Nginx 是否启动。

### 3. 访问 `8.148.199.180:3000` 需要 VPN

可能是当前网络限制非标准端口 3000。推荐配置 Nginx 后通过 80 端口访问：

```text
http://8.148.199.180
```

### 4. MySQL 提示 Access denied

说明 MySQL 密码错误或认证方式不匹配。需要确认服务器 `.env` 中的 `DB_PASSWORD` 与实际 MySQL 密码一致。

### 5. 购物车或我的订单打不开

如果线上环境里前端请求写死 `localhost:3000`，浏览器会请求用户自己的电脑。当前项目已改为 `getApiBaseUrl()` 自动适配本地和线上环境。

## 测试说明

建议测试以下流程：

1. 访问首页
2. 注册普通用户
3. 登录用户
4. 浏览商品
5. 搜索商品
6. 按类别筛选商品
7. 加入购物车
8. 修改购物车数量
9. 提交订单
10. 支付订单
11. 查看我的订单
12. 管理员登录
13. 添加商品类别
14. 添加或修改商品
15. 添加销售人员
16. 查看销售报表
17. 查看销售趋势图
18. 查看销售预测和异常监控
19. 查看商品排行榜
20. 切换语言

## AI 工具使用说明

本项目开发过程中使用了 Cursor AI 编程助手，主要用于：

- 功能需求拆解
- 后端 API 设计
- 前端页面逻辑实现
- 数据库模型设计
- 登录、购物车、订单问题排查
- 阿里云部署排错
- PM2 和 Nginx 配置辅助
- 课程设计报告和 README 编写

AI 生成内容经过人工审查、运行测试和部署验证后采用。

## 后续可扩展方向

- 接入真实支付接口
- 接入真实短信或邮件验证码
- 商品图片上传
- 域名绑定
- HTTPS 证书配置
- 更复杂的机器学习推荐算法
- 更细粒度的数据可视化报表
- 商品评论和评分系统
- 优惠券和促销系统

## 许可证

MIT License
