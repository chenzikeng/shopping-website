// 测试完整订单流程（包括发货通知邮件）
const http = require('http');

// 配置
const BASE_URL = 'localhost';
const PORT = 3000;
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'admin123';

// 辅助函数：发送HTTP请求
async function makeRequest(method, path, data = null, token = null) {
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

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

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

// 测试完整流程
async function testFullOrderEmailFlow() {
  console.log('=== 测试完整订单流程（包括发货通知邮件） ===');
  
  let userToken = null;
  let adminToken = null;
  let orderId = null;

  try {
    // 1. 用户登录
    console.log('1. 用户登录...');
    const loginResponse = await makeRequest('POST', '/api/auth/login', {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    if (loginResponse.statusCode !== 200) {
      throw new Error('用户登录失败');
    }
    userToken = loginResponse.data.token;
    console.log('✅ 用户登录成功');

    // 2. 清空购物车
    console.log('2. 清空购物车...');
    await makeRequest('DELETE', '/api/cart', null, userToken);
    console.log('✅ 购物车已清空');

    // 3. 添加商品到购物车
    console.log('3. 添加商品到购物车...');
    await makeRequest('POST', '/api/cart/add', {
      productId: 1,
      quantity: 1
    }, userToken);
    console.log('✅ 商品添加到购物车成功');

    // 4. 创建订单
    console.log('4. 创建订单...');
    const createOrderResponse = await makeRequest('POST', '/api/orders', {
      shippingAddress: '测试地址',
      paymentMethod: '支付宝'
    }, userToken);
    console.log('创建订单响应状态：', createOrderResponse.statusCode);
    console.log('创建订单响应数据：', createOrderResponse.data);
    if (createOrderResponse.statusCode !== 201) {
      throw new Error('创建订单失败');
    }
    orderId = createOrderResponse.data.order.id;
    console.log(`✅ 订单创建成功，订单号：${orderId}`);

    // 5. 支付订单
    console.log('5. 支付订单...');
    const payResponse = await makeRequest('POST', `/api/orders/${orderId}/pay`, null, userToken);
    if (payResponse.statusCode !== 200) {
      throw new Error('支付订单失败');
    }
    console.log('✅ 订单支付成功');

    // 6. 检查订单确认邮件
    console.log('6. 检查订单确认邮件...');
    const emailsAfterPay = await makeRequest('POST', '/api/email', { email: USER_EMAIL });
    console.log(`支付后邮件数量：${emailsAfterPay.data.length}`);
    emailsAfterPay.data.forEach(email => {
      console.log(`- ${email.subject}`);
    });

    // 7. 管理员登录
    console.log('7. 管理员登录...');
    const adminLoginResponse = await makeRequest('POST', '/api/auth/login', {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    if (adminLoginResponse.statusCode !== 200) {
      throw new Error('管理员登录失败');
    }
    adminToken = adminLoginResponse.data.token;
    console.log('✅ 管理员登录成功');

    // 8. 管理员确认发货
    console.log('8. 管理员确认发货...');
    const shipResponse = await makeRequest('POST', `/api/orders/${orderId}/ship`, null, adminToken);
    if (shipResponse.statusCode !== 200) {
      throw new Error('确认发货失败');
    }
    console.log('✅ 订单确认发货成功');

    // 9. 检查发货通知邮件
    console.log('9. 检查发货通知邮件...');
    const emailsAfterShip = await makeRequest('POST', '/api/email', { email: USER_EMAIL });
    console.log(`确认发货后邮件数量：${emailsAfterShip.data.length}`);
    emailsAfterShip.data.forEach(email => {
      console.log(`- ${email.subject}`);
    });

    // 10. 验证所有邮件
    const orderConfirmationEmails = emailsAfterShip.data.filter(email => 
      email.subject.includes('订单确认')
    );
    const shipmentNotificationEmails = emailsAfterShip.data.filter(email => 
      email.subject.includes('发货通知')
    );

    console.log('\n=== 测试结果 ===');
    console.log(`订单确认邮件数量：${orderConfirmationEmails.length}`);
    console.log(`发货通知邮件数量：${shipmentNotificationEmails.length}`);

    if (orderConfirmationEmails.length > 0 && shipmentNotificationEmails.length > 0) {
      console.log('✅ 测试成功！已收到订单确认邮件和发货通知邮件');
    } else {
      console.log('❌ 测试失败！未收到预期的邮件');
    }

  } catch (error) {
    console.error('测试过程中发生错误：', error.message);
  }
}

// 执行测试
testFullOrderEmailFlow();