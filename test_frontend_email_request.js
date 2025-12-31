const http = require('http');

// 模拟前端获取邮件请求
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
      
      // 模拟前端处理邮件数据
      try {
        const emails = JSON.parse(body);
        console.log('解析后的邮件数量:', emails.length);
        console.log('第一封邮件:', emails[0]);
      } catch (error) {
        console.error('解析邮件数据错误:', error);
      }
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