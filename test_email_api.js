const http = require('http');

// 发送测试邮件
const sendEmail = () => {
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
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('发送邮件响应:', body);
      // 发送邮件后检查邮件
      checkEmail();
    });
  });

  req.on('error', (e) => {
    console.error('发送邮件错误:', e);
  });

  req.write(data);
  req.end();
};

// 检查邮件
const checkEmail = () => {
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
      'Content-Length': data.length
    }
  };

  const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => {
      body += chunk;
    });
    res.on('end', () => {
      console.log('检查邮件响应:', body);
      try {
        const emails = JSON.parse(body);
        console.log('邮件数量:', emails.length);
        console.log('邮件列表:', emails);
      } catch (e) {
        console.error('解析邮件数据错误:', e);
      }
    });
  });

  req.on('error', (e) => {
    console.error('检查邮件错误:', e);
  });

  req.write(data);
  req.end();
};

// 开始测试
sendEmail();