const http = require('http');

const PORT = 3000;
const HOST = '0.0.0.0';

// 创建一个极简的HTTP服务器
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello, World!\n');
});

// 监听所有接口
server.listen(PORT, HOST, () => {
  console.log(`服务器正在监听 ${HOST}:${PORT}`);
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

process.on('SIGINT', () => {
  console.log('收到中断信号，正在关闭服务器...');
  server.close(() => {
    console.log('服务器已关闭');
    process.exit(0);
  });
});