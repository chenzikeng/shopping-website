const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 只从models导入sequelize实例和模型（models中已经导入了config/db.js中的sequelize实例）
const { sequelize, User, Product, Cart, Order, OrderItem } = require('./backend/models');

// 导入路由
const authRoutes = require('./backend/routes/auth');
const productRoutes = require('./backend/routes/products');
const cartRoutes = require('./backend/routes/cart');
const orderRoutes = require('./backend/routes/orders');
const adminRoutes = require('./backend/routes/admin');

// 使用路由
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// 首页路由
app.get('/', (req, res) => {
  res.send('修复后的购物网站后端API正在运行');
});

// 启动服务器
async function startServer() {
  try {
    console.log('开始初始化服务器...');
    console.log('服务器PID:', process.pid);
    
    // 只同步模型，不重复创建连接
    await sequelize.sync({ force: false });
    console.log('数据库表同步成功');
    
    // 监听端口
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`服务器正在运行在 http://localhost:${PORT}`);
      console.log('服务器PID:', process.pid);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

// 启动服务器
startServer();