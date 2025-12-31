# 在线购物网站
姓名：陈子铿
学号：202330452641

一个基于 Node.js + Express + MySQL 的在线购物网站系统。

## 功能特点

### 顾客功能
- 用户注册、登录、注销
- 产品列表展示
- 购物车功能（添加、删除、修改数量）
- 订单管理（创建订单、查看订单历史）
- 支付功能
- 个人信息管理

### 管理员功能
- 产品目录管理（添加、删除、修改）
- 订单管理
- 销售统计报表
- 用户管理

## 技术栈

- **后端框架**: Node.js + Express
- **数据库**: MySQL
- **ORM**: Sequelize
- **前端**: HTML + CSS + JavaScript
- **身份验证**: JWT
- **包管理**: npm

## 项目结构

```
shopping-web/
├── backend/
│   ├── config/
│   │   └── database.js      # 数据库配置
│   ├── controllers/
│   │   ├── auth.js          # 认证控制器
│   │   ├── products.js      # 产品控制器
│   │   ├── cart.js          # 购物车控制器
│   │   ├── orders.js        # 订单控制器
│   │   └── admin.js         # 管理员控制器
│   ├── models/
│   │   ├── User.js          # 用户模型
│   │   ├── Product.js       # 产品模型
│   │   ├── Cart.js          # 购物车模型
│   │   ├── Order.js         # 订单模型
│   │   └── OrderItem.js     # 订单项模型
│   ├── routes/
│   │   ├── auth.js          # 认证路由
│   │   ├── products.js      # 产品路由
│   │   ├── cart.js          # 购物车路由
│   │   ├── orders.js        # 订单路由
│   │   └── admin.js         # 管理员路由
│   ├── middlewares/
│   │   ├── auth.js          # 认证中间件
│   │   └── admin.js         # 管理员中间件
│   └── server.js            # 服务器入口
├── frontend/
│   ├── pages/
│   │   ├── index.html       # 首页
│   │   ├── login.html       # 登录页
│   │   ├── register.html    # 注册页
│   │   ├── products.html    # 产品列表页
│   │   ├── product.html     # 产品详情页
│   │   ├── cart.html        # 购物车页
│   │   ├── checkout.html    # 结账页
│   │   ├── orders.html      # 订单页
│   │   └── admin.html       # 管理员页
│   ├── css/
│   │   └── styles.css       # 样式文件
│   ├── js/
│   │   ├── main.js          # 主脚本
│   │   ├── auth.js          # 认证脚本
│   │   ├── products.js      # 产品脚本
│   │   ├── cart.js          # 购物车脚本
│   │   ├── orders.js        # 订单脚本
│   │   └── admin.js         # 管理员脚本
│   └── images/              # 图片资源
├── .env.example             # 环境变量示例
├── package.json             # 项目配置
└── README.md                # 项目说明
```

## 安装与运行

### 前置条件

- Node.js 16+ 和 npm
- MySQL 5.7+

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <项目地址>
   cd shopping-web
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置数据库**
   - 创建一个MySQL数据库
   - 复制`.env.example`为`.env`并配置数据库连接信息

4. **创建环境变量文件**
   ```bash
   cp .env.example .env
   ```

5. **配置`.env`文件**
   ```
   # 数据库配置
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=shopping_db

   # 服务器配置
   PORT=3000

   # JWT密钥
   JWT_SECRET=your_jwt_secret
   ```

6. **启动服务器**
   ```bash
   npm start
   ```

7. **访问网站**
   在浏览器中访问 `http://localhost:3000`

### 开发模式

如果需要开发模式运行（自动重启服务器）：

```bash
npm run dev
```

## 数据库表结构

### 用户表 (Users)
- id (主键)
- username (用户名)
- password (密码哈希)
- email (邮箱)
- phone (电话)
- isAdmin (是否管理员)
- createdAt (创建时间)
- updatedAt (更新时间)

### 产品表 (Products)
- id (主键)
- name (产品名称)
- description (产品描述)
- price (价格)
- stock (库存)
- createdAt (创建时间)
- updatedAt (更新时间)

### 购物车表 (Carts)
- id (主键)
- userId (用户ID)
- productId (产品ID)
- quantity (数量)
- createdAt (创建时间)
- updatedAt (更新时间)

### 订单表 (Orders)
- id (主键)
- userId (用户ID)
- totalPrice (总价)
- status (状态)
- shippingAddress (收货地址)
- paymentMethod (支付方式)
- createdAt (创建时间)
- updatedAt (更新时间)

### 订单项表 (OrderItems)
- id (主键)
- orderId (订单ID)
- productId (产品ID)
- quantity (数量)
- price (单价)
- createdAt (创建时间)
- updatedAt (更新时间)

## API 接口

### 认证接口
- POST /api/auth/register - 用户注册
- POST /api/auth/login - 用户登录
- POST /api/auth/logout - 用户注销

### 产品接口
- GET /api/products - 获取产品列表
- GET /api/products/:id - 获取产品详情

### 购物车接口
- GET /api/cart - 获取购物车内容
- POST /api/cart - 添加到购物车
- PUT /api/cart/:id - 更新购物车项数量
- DELETE /api/cart/:id - 删除购物车项

### 订单接口
- GET /api/orders - 获取订单列表
- POST /api/orders - 创建订单
- GET /api/orders/:id - 获取订单详情

### 管理员接口
- GET /api/admin/products - 获取所有产品
- POST /api/admin/products - 添加产品
- PUT /api/admin/products/:id - 更新产品
- DELETE /api/admin/products/:id - 删除产品
- GET /api/admin/orders - 获取所有订单
- PUT /api/admin/orders/:id - 更新订单状态
- GET /api/admin/stats - 获取销售统计

## 前端页面

- `/` - 首页/产品列表页
- `/login` - 登录页
- `/register` - 注册页
- `/products` - 产品列表页
- `/product/:id` - 产品详情页
- `/cart` - 购物车页
- `/checkout` - 结账页
- `/orders` - 订单历史页
- `/admin` - 管理员控制台

## 注意事项

1. 请确保MySQL数据库已正确安装并运行
2. 首次运行时，数据库表会自动创建（使用Sequelize的sync功能）
3. 管理员账号需要手动在数据库中设置isAdmin为true
4. 建议在生产环境中关闭Sequelize的sync功能，改为使用数据库迁移

## 扩展功能

1. 实现图片上传功能
2. 添加产品分类
3. 实现产品搜索和筛选
4. 添加评论和评分功能
5. 实现优惠券系统
6. 添加多语言支持

## 许可证

MIT License
