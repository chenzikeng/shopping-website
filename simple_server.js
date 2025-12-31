const express = require('express');
const app = express();

// 简单的首页路由
app.get('/', (req, res) => {
  res.send('简单的Express服务器正在运行');
});

// 简单的API路由
app.get('/api/test', (req, res) => {
  res.json({ message: 'API测试成功' });
});

// 启动服务器
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`简单服务器正在运行在 http://localhost:${PORT}`);
  console.log('服务器PID:', process.pid);
  
  // 保持进程运行
  setTimeout(() => {
    console.log('服务器运行了10秒后自动关闭');
  }, 10000);
});