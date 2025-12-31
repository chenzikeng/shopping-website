const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 只导入数据库连接
const db = require('./backend/config/db');

// 简单的首页路由
app.get('/', (req, res) => {
  res.send('最小测试服务器正在运行');
});

// 启动服务器
const PORT = 3004;
app.listen(PORT, () => {
  console.log(`最小测试服务器正在运行在 http://localhost:${PORT}`);
  console.log('服务器PID:', process.pid);
});

// 添加错误处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
});