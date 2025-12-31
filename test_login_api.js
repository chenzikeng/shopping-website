// 测试登录API
const http = require('http');

// 配置
const BASE_URL = 'localhost';
const PORT = 3000;
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// 辅助函数：发送HTTP请求
async function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseBody);
          resolve({ statusCode: res.statusCode, data: parsed });
        } catch (error) {
          resolve({ statusCode: res.statusCode, data: responseBody });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 测试登录功能
async function testLogin() {
  console.log('=== 测试登录API ===');
  
  try {
    // 发送登录请求
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    console.log('登录响应状态：', loginResponse.statusCode);
    console.log('登录响应数据：', loginResponse.data);
    
    if (loginResponse.statusCode === 200) {
      console.log('✅ 登录成功！登录API正常工作');
    } else {
      console.log('❌ 登录失败，状态码：', loginResponse.statusCode);
    }
    
  } catch (error) {
    console.error('❌ 登录请求失败：', error.message);
    console.error('错误详情：', error);
  }
}

// 执行测试
testLogin();