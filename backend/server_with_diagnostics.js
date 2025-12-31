const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { Sequelize } = require('sequelize');

// 加载环境变量
dotenv.config();

console.log('=== 启动服务器诊断信息 ===');
console.log('当前工作目录:', process.cwd());
console.log('环境变量加载情况:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已加载***' : '未加载');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);
console.log('============================');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试数据库连接函数
async function testDatabaseConnection() {
  console.log('\n=== 测试数据库连接 ===');
  try {
    // 创建数据库连接
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        port: 3306,
        logging: console.log,
        pool: {
          max: 10,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    // 测试连接
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    return sequelize;
  } catch (err) {
    console.error('❌ 数据库连接失败:', err);
    console.error('错误类型:', err.name);
    console.error('错误代码:', err.original ? err.original.code : 'N/A');
    console.error('错误信息:', err.message);
    throw err;
  }
}

// 启动服务器
async function startServer() {
  try {
    // 测试数据库连接
    const sequelize = await testDatabaseConnection();

    // 导入模型
    console.log('\n=== 导入模型 ===');
    const models = require('./models');
    console.log('✅ 模型导入成功');

    // 同步数据库表
    console.log('\n=== 同步数据库表 ===');
    await sequelize.sync({ force: false });
    console.log('✅ 数据库表同步成功');

    // 导入路由
    console.log('\n=== 导入路由 ===');
    const authRoutes = require('./routes/auth');
    const productRoutes = require('./routes/products');
    const cartRoutes = require('./routes/cart');
    const orderRoutes = require('./routes/orders');
    const adminRoutes = require('./routes/admin');
    const emailRoutes = require('./routes/email');
    console.log('✅ 路由导入成功');

    // 使用路由
    app.use('/api/auth', authRoutes);
    app.use('/api/products', productRoutes);
    app.use('/api/cart', cartRoutes);
    app.use('/api/orders', orderRoutes);
    app.use('/api/admin', adminRoutes);
    app.use('/api/email', emailRoutes);

    // 静态文件服务
    app.use(express.static(path.join(__dirname, 'public')));

    // 首页路由
    app.get('/', (req, res) => {
      res.send('购物网站后端API正在运行');
    });

    // 监听端口
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log(`\n✅ 服务器正在运行在 http://localhost:${PORT}`);
      console.log('服务器PID:', process.pid);
    });

    server.on('error', (err) => {
      console.error('\n❌ 服务器监听错误:', err);
    });

    // 捕获未处理的错误
    process.on('uncaughtException', (err) => {
      console.error('\n❌ 未捕获的异常:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('\n❌ 未处理的Promise拒绝:', reason);
    });

  } catch (err) {
    console.error('\n❌ 启动服务器时发生错误:', err);
    process.exit(1);
  }
}

// 启动服务器
startServer();
