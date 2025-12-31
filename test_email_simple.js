const http = require('http');

// 简单测试发送邮件API
const testSendEmail = () => {
  const data = JSON.stringify({
    from: 'noreply@onlineshop.com',
    to: 'test@example.com',
    subject: '测试邮件',
    body: '<h1>测试邮件内容</h1><p>这是一封测试邮件</p>'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/email/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = http.request(options, (res) => {
    console.log('发送邮件响应状态:', res.statusCode);
    console.log('发送邮件响应头:', res.headers);
    
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('发送邮件响应内容:', body);
    });
  });

  req.on('error', (e) => {
    console.error('发送邮件错误:', e);
  });

  console.log('发送请求数据:', data);
  req.write(data);
  req.end();
};

// 运行测试
testSendEmail();