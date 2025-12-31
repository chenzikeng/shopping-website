const http = require('http');

// 先发送一封测试邮件
const sendTestEmail = (callback) => {
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
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('发送测试邮件成功:', JSON.parse(body));
      callback();
    });
  });

  req.on('error', (e) => {
    console.error('发送测试邮件错误:', e);
  });

  req.write(data);
  req.end();
};

// 然后模拟前端获取邮件
sendTestEmail(() => {
  console.log('现在请在前端输入 test@example.com 并点击检查邮件按钮');
});