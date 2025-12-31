// 模拟完整的用户下单流程并检查邮件发送
const http = require('http');

// 测试参数
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'test123';
const PRODUCT_ID = 1;
const PRODUCT_QUANTITY = 1;

// 辅助函数：发送HTTP请求
function sendRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// 测试完整订单流程
async function testFullOrderEmail() {
  console.log('=== 测试完整订单流程并检查邮件发送 ===');
  
  let token = null;
  
  try {
    // 1. 用户登录
    console.log('1. 用户登录...');
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const loginData = {
      email: USER_EMAIL,
      password: USER_PASSWORD
    };
    
    const loginResponse = await sendRequest(loginOptions, loginData);
    if (loginResponse.statusCode !== 200) {
      throw new Error('登录失败，状态码: ' + loginResponse.statusCode);
    }
    
    const loginResult = JSON.parse(loginResponse.body);
    token = loginResult.token;
    console.log('登录成功，获取到token');
    
    // 2. 清空购物车（可选）
    console.log('2. 清空购物车...');
    const clearCartOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/cart',
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
    
    await sendRequest(clearCartOptions);
    console.log('购物车已清空');
    
    // 3. 添加商品到购物车
    console.log('3. 添加商品到购物车...');
    const addToCartOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/cart/add',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const addToCartData = {
      productId: PRODUCT_ID,
      quantity: PRODUCT_QUANTITY
    };
    
    const addToCartResponse = await sendRequest(addToCartOptions, addToCartData);
    if (addToCartResponse.statusCode !== 200) {
      throw new Error('添加商品到购物车失败，状态码: ' + addToCartResponse.statusCode);
    }
    console.log('商品添加到购物车成功');
    
    // 4. 创建订单
    console.log('4. 创建订单...');
    const createOrderOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    };
    
    const createOrderData = {
      shippingAddress: '测试地址',
      paymentMethod: '测试支付方式'
    };
    
    const createOrderResponse = await sendRequest(createOrderOptions, createOrderData);
    if (createOrderResponse.statusCode !== 201) {
      throw new Error('创建订单失败，状态码: ' + createOrderResponse.statusCode);
    }
    
    const orderResult = JSON.parse(createOrderResponse.body);
    const orderId = orderResult.order.id;
    console.log(`订单创建成功，订单号：${orderId}`);
    
    // 5. 检查订单确认邮件
    console.log('5. 检查订单确认邮件...');
    const checkEmailOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const checkEmailData = {
      email: USER_EMAIL
    };
    
    const checkEmailResponse = await sendRequest(checkEmailOptions, checkEmailData);
    if (checkEmailResponse.statusCode !== 200) {
      throw new Error('检查邮件失败，状态码: ' + checkEmailResponse.statusCode);
    }
    
    const emails = JSON.parse(checkEmailResponse.body);
    console.log(`当前邮件数量：${emails.length}`);
    
    // 查找订单确认邮件
    const orderConfirmationEmail = emails.find(email => 
      email.subject.includes('订单确认') && email.body.includes(orderId)
    );
    
    if (orderConfirmationEmail) {
      console.log('✅ 找到订单确认邮件！');
      console.log('邮件主题:', orderConfirmationEmail.subject);
      console.log('邮件时间:', orderConfirmationEmail.timestamp);
    } else {
      console.log('❌ 未找到订单确认邮件！');
      console.log('所有邮件列表:');
      emails.forEach(email => {
        console.log(`- ${email.subject}`);
      });
    }
    
    console.log('\n=== 测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误:', error.message);
  }
}

// 运行测试
testFullOrderEmail();