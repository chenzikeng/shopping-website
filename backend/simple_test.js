console.log('开始测试数据库连接和模型导入...');

// 测试环境变量加载
try {
  require('dotenv').config();
  console.log('环境变量加载成功');
  console.log('PORT:', process.env.PORT);
  console.log('DB_HOST:', process.env.DB_HOST);
} catch (err) {
  console.error('环境变量加载失败:', err);
  process.exit(1);
}

// 测试数据库连接
try {
  const db = require('./config/db');
  console.log('数据库配置导入成功');
} catch (err) {
  console.error('数据库配置导入失败:', err);
  process.exit(1);
}

// 测试模型导入
try {
  const models = require('./models');
  console.log('模型导入成功');
  console.log('已加载的模型:', Object.keys(models));
} catch (err) {
  console.error('模型导入失败:', err);
  process.exit(1);
}

// 测试路由导入
try {
  const authRoutes = require('./routes/auth');
  const productRoutes = require('./routes/products');
  const cartRoutes = require('./routes/cart');
  const orderRoutes = require('./routes/orders');
  const adminRoutes = require('./routes/admin');
  console.log('所有路由导入成功');
} catch (err) {
  console.error('路由导入失败:', err);
  process.exit(1);
}

console.log('所有测试通过！');
process.exit(0);