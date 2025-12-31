const http = require('http');

// 测试获取邮件API
const testGetEmail = () => {
  const data = JSON.stringify({
    email: 'test@example.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    console.log('获取邮件响应状态:', res.statusCode);
    console.log('获取邮件响应头:', res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('获取邮件响应内容:', body);
    });
  });

  req.on('error', (e) => {
    console.error('获取邮件错误:', e);
  });

  console.log('发送请求数据:', data);
  req.write(data);
  req.end();
};

// 运行测试
testGetEmail();