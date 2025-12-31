const express = require('express');
const cors = require('cors');
const path = require('path');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务 - 提供前端文件
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// 提供前端路由
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.get('/admin*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'admin.html'));
});

app.get('/cart*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'cart.html'));
});

app.get('/orders*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'orders.html'));
});

app.get('/login*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'login.html'));
});

app.get('/register*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'register.html'));
});

app.get('/email*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'email.html'));
});

// API路由 - 简单的响应
app.get('/api', (req, res) => {
  res.json({ message: '前端服务器正在运行' });
});

app.get('/api/products', (req, res) => {
  res.json([]);
});

app.get('/api/auth/status', (req, res) => {
  res.json({ loggedIn: false });
});

// 监听端口
const PORT = process.env.PORT || 3000;
try {
  const server = app.listen(PORT, () => {
    console.log(`前端服务器正在运行在 http://localhost:${PORT}`);
    console.log('前端文件路径:', frontendPath);
    console.log('服务器PID:', process.pid);
  });
  
  server.on('error', (err) => {
    console.error('服务器监听错误:', err);
  });
  
} catch (err) {
  console.error('启动服务器时发生错误:', err);
}