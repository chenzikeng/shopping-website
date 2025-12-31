const http = require('http');

// 测试虚拟邮件功能
console.log('=== 测试虚拟邮件功能 ===');

// 发送测试邮件
function sendTestEmail() {
  const emailData = JSON.stringify({
    from: 'noreply@onlineshop.com',
    to: 'test@example.com',
    subject: '测试邮件',
    body: '<h1>这是一封测试邮件</h1><p>测试虚拟邮件功能是否正常工作</p>'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/email/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': emailData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('发送测试邮件响应:', JSON.parse(data));
      
      // 发送邮件后检查邮件
      setTimeout(checkEmails, 1000);
    });
  });

  req.on('error', (error) => {
    console.error('发送测试邮件错误:', error);
  });

  req.write(emailData);
  req.end();
}

// 检查邮件
function checkEmails() {
  const emailCheckData = JSON.stringify({
    email: 'test@example.com'
  });

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/email',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': emailCheckData.length
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      const emails = JSON.parse(data);
      console.log('检查邮件响应:');
      console.log(`共收到 ${emails.length} 封邮件`);
      
      emails.forEach((email, index) => {
        console.log(`\n邮件 ${index + 1}:`);
        console.log(`  主题: ${email.subject}`);
        console.log(`  发件人: ${email.from}`);
        console.log(`  收件人: ${email.to}`);
        console.log(`  时间: ${email.timestamp}`);
        console.log(`  内容: ${email.body}`);
      });

      console.log('\n=== 测试完成 ===');
    });
  });

  req.on('error', (error) => {
    console.error('检查邮件错误:', error);
  });

  req.write(emailCheckData);
  req.end();
}

// 开始测试
sendTestEmail();