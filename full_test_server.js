const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 加载环境变量
dotenv.config({ path: './backend/.env' });

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 导入模型和数据库连接
const { sequelize } = require('./backend/models');

// 简单的首页路由
app.get('/', (req, res) => {
  res.send('完整测试服务器正在运行');
});

// 测试API路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API测试成功' });
});

// 测试模型同步
async function startServer() {
  try {
    console.log('开始测试数据库连接...');
    await sequelize.authenticate();
    console.log('数据库连接成功');
    
    console.log('开始测试模型同步...');
    await sequelize.sync({ force: false });
    console.log('模型同步成功');
    
    // 启动服务器
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`完整测试服务器正在运行在 http://localhost:${PORT}`);
      console.log('服务器PID:', process.pid);
    });
    
  } catch (error) {
    console.error('启动服务器失败:', error);
  }
}

startServer();