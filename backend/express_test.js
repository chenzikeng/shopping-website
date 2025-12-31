const express = require('express');
const path = require('path');
const cors = require('cors');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// 简单的健康检查路由
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 简单的测试路由
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Express server is working!' });
});

// 404处理
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`服务器正在运行在 http://${HOST}:${PORT}`);
  console.log('服务器PID:', process.pid);
  
  // 输出当前时间，证明服务器正在运行
  setInterval(() => {
    console.log(new Date().toISOString() + ': 服务器仍在运行');
  }, 5000);
});

// 捕获所有可能的错误
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
  console.error(err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的Promise拒绝:', reason);
  if (reason instanceof Error) {
    console.error(reason.stack);
  }
});