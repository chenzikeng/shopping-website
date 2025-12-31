const express = require('express');
const app = express();
const PORT = 3006;

// 简单的测试路由
app.get('/api/test', (req, res) => {
  res.json({ message: '测试API成功', timestamp: new Date().toISOString() });
});

app.get('/', (req, res) => {
  res.send('简单服务器正在运行');
});

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`简单服务器正在运行在 http://localhost:${PORT}`);
  console.log('服务器PID:', process.pid);
});

// 错误处理
server.on('error', (err) => {
  console.error('服务器监听错误:', err);
});

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