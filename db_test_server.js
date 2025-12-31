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

// 导入数据库连接
const db = require('./backend/config/db');

// 简单的首页路由
app.get('/', (req, res) => {
  res.send('包含数据库连接的Express服务器正在运行');
});

// 测试数据库连接的路由
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT 1+1 AS result');
    res.json({ message: '数据库连接成功', result: result[0] });
  } catch (error) {
    res.status(500).json({ message: '数据库连接失败', error: error.message });
  }
});

// 启动服务器
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`数据库测试服务器正在运行在 http://localhost:${PORT}`);
  console.log('服务器PID:', process.pid);
});