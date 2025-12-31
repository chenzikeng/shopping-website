const http = require('http');

// 测试发送邮件API
const testSendEmail = () => {
  return new Promise((resolve, reject) => {
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
        console.log('发送邮件响应状态:', res.statusCode);
        console.log('发送邮件响应内容:', body);
        resolve(JSON.parse(body));
      });
    });

    req.on('error', (e) => {
      console.error('发送邮件错误:', e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// 测试获取邮件API
const testGetEmails = () => {
  return new Promise((resolve, reject) => {
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
        console.log('获取邮件响应状态:', res.statusCode);
        console.log('获取邮件响应内容:', body);
        resolve(JSON.parse(body));
      });
    });

    req.on('error', (e) => {
      console.error('获取邮件错误:', e);
      reject(e);
    });

    req.write(data);
    req.end();
  });
};

// 运行测试
async function runTests() {
  try {
    console.log('开始测试邮件API...');
    
    // 先发送一封测试邮件
    console.log('\n1. 测试发送邮件API:');
    await testSendEmail();
    
    // 然后获取邮件
    console.log('\n2. 测试获取邮件API:');
    const emails = await testGetEmails();
    
    console.log('\n测试完成!');
    console.log('获取到的邮件数量:', emails.length);
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

runTests();