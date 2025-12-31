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

// 简单路由
app.get('/', (req, res) => {
  res.send('逐步测试服务器正在运行');
});

app.get('/api/test', (req, res) => {
  res.json({ message: '测试成功', timestamp: new Date().toISOString() });
});

// 启动服务器（不连接数据库）
const PORT = process.env.PORT || 3000;

try {
  const server = app.listen(PORT, () => {
    console.log(`逐步测试服务器正在运行在 http://localhost:${PORT}`);
    console.log('服务器PID:', process.pid);
  });
  
  // 错误处理
  server.on('error', (err) => {
    console.error('服务器监听错误:', err);
    console.error(err.stack);
  });
  
  process.on('uncaughtException', (err) => {
    console.error('未捕获的异常:', err);
    console.error(err.stack);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason, promise) => {
    console.error('未处理的Promise拒绝:', reason);
    if (reason instanceof Error) {
      console.error(reason.stack);
    }
  });
  
} catch (err) {
  console.error('启动服务器时发生错误:', err);
  console.error(err.stack);
}