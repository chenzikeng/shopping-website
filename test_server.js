const express = require('express');

const app = express();
const PORT = 3005;

app.get('/', (req, res) => {
  console.log('收到请求:', req.ip);
  res.send('Hello from Express Server!');
});

app.listen(PORT, () => {
  console.log(`
Express服务器正在运行在 http://localhost:${PORT}`);
  console.log('服务器PID:', process.pid);
  console.log('按Ctrl+C停止服务器');
});

// 添加错误处理
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('未处理的Promise拒绝:', reason);
});