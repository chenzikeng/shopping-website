const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config({ path: './backend/.env' });

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());

// 导入模型和数据库连接
const { sequelize, User, Product, Cart, Order, OrderItem } = require('./backend/models');

// 简单的首页路由
app.get('/', (req, res) => {
  res.send('包含模型同步的Express服务器正在运行');
});

// 测试模型同步
async function testModelSync() {
  try {
    console.log('开始测试数据库连接...');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    console.log('开始测试模型同步...');
    await sequelize.sync({ force: false });
    console.log('模型同步成功');
    
    return true;
  } catch (error) {
    console.error('测试失败:', error);
    return false;
  }
}

// 启动服务器
const PORT = 3003;

testModelSync()
  .then((success) => {
    if (success) {
      app.listen(PORT, () => {
        console.log(`模型同步测试服务器正在运行在 http://localhost:${PORT}`);
        console.log('服务器PID:', process.pid);
      });
    } else {
      console.log('测试失败，服务器未启动');
    }
  });