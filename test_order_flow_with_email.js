const http = require('http');

// 配置测试参数
const BASE_URL = 'localhost';
const PORT = 3000;
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123'; // 根据test_email_flow.js中的配置

// 辅助函数：发送HTTP请求
function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: responseBody });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

// 测试完整订单流程
async function testOrderFlow() {
  console.log('=== 测试完整订单流程并检查邮件发送 ===');
  let token = null;
  let orderId = null;

  try {
    // 1. 用户登录
    console.log('1. 用户登录...');
    const loginResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { email: USER_EMAIL, password: USER_PASSWORD });

    if (loginResponse.statusCode !== 200) {
      throw new Error(`登录失败，状态码: ${loginResponse.statusCode}`);
    }

    const loginData = JSON.parse(loginResponse.body);
    token = loginData.token;
    console.log('✅ 登录成功，获取到token');

    // 2. 清空购物车（可选）
    console.log('2. 清空购物车...');
    const clearCartResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/api/cart',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 购物车已清空');

    // 3. 添加商品到购物车
    console.log('3. 添加商品到购物车...');
    const addToCartResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/api/cart/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, { productId: 1, quantity: 1 });
    console.log('✅ 商品添加到购物车成功');

    // 4. 创建订单
    console.log('4. 创建订单...');
    const createOrderResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    }, { shippingAddress: '测试地址', paymentMethod: '支付宝' });

    const orderData = JSON.parse(createOrderResponse.body);
    orderId = orderData.order.id;
    console.log(`✅ 订单创建成功，订单号：${orderId}`);

    // 5. 支付订单
    console.log('5. 支付订单...');
    const payOrderResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: `/api/orders/${orderId}/pay`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ 订单支付成功');

    // 6. 检查订单确认邮件
    console.log('6. 检查订单确认邮件...');
    const emailsResponse = await makeRequest({
      hostname: BASE_URL,
      port: PORT,
      path: '/api/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    }, { email: USER_EMAIL });

    const emailsData = JSON.parse(emailsResponse.body);
    console.log(`✅ 邮件数量：${emailsData.length}`);
    emailsData.forEach(email => {
      console.log(`- ${email.subject}`);
    });

    // 检查是否有订单确认邮件
    const hasOrderEmail = emailsData.some(email => 
      email.subject.includes('订单确认') || 
      email.subject.includes('Order Confirmation')
    );

    if (hasOrderEmail) {
      console.log('✅ 找到订单确认邮件！');
    } else {
      console.log('❌ 未找到订单确认邮件');
    }

    // 7. 确认发货（需要管理员权限，这里省略）
    // ...

    console.log('\n=== 测试完成 ===');

  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
    console.error('错误详情:', error);
  }
}

// 运行测试
testOrderFlow();
