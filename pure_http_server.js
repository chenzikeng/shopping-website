const http = require('http');

const PORT = 3007;

// 创建纯Node.js HTTP服务器
const server = http.createServer((req, res) => {
  // 设置响应头
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // 处理GET请求
  if (req.method === 'GET' && req.url === '/api/test') {
    res.writeHead(200);
    res.end(JSON.stringify({ message: '纯HTTP服务器测试成功', timestamp: new Date().toISOString() }));
    return;
  }

  // 处理根路径
  if (req.method === 'GET' && req.url === '/') {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(200);
    res.end('纯HTTP服务器正在运行');
    return;
  }

  // 404响应
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// 启动服务器
server.listen(PORT, () => {
  console.log(`纯HTTP服务器正在运行在 http://localhost:${PORT}`);
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