const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置测试参数
const BASE_URL = 'http://localhost:3000/api';
const USER_EMAIL = 'test@example.com';
const USER_PASSWORD = 'password123';
const USER_NAME = 'Test User';

// 创建axios实例
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testEmailFlow() {
  console.log('=== 开始测试邮件流程 ===');
  
  try {
    // 1. 用户登录
    console.log('1. 用户登录...');
    const loginResponse = await api.post('/auth/login', {
      email: USER_EMAIL,
      password: USER_PASSWORD
    });
    
    if (!loginResponse.data.token) {
      throw new Error('登录失败：未获取到token');
    }
    
    const token = loginResponse.data.token;
    console.log('登录成功，获取到token');
    
    // 设置请求头包含token
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // 2. 清空购物车（可选）
    console.log('2. 清空购物车...');
    await api.delete('/cart');
    console.log('购物车已清空');
    
    // 3. 添加商品到购物车
    console.log('3. 添加商品到购物车...');
    await api.post('/cart/add', {
      productId: 1,
      quantity: 1
    });
    console.log('商品添加到购物车成功');
    
    // 4. 创建订单
    console.log('4. 创建订单...');
    const orderResponse = await api.post('/orders/create');
    
    if (!orderResponse.data.order || !orderResponse.data.order.id) {
      throw new Error('创建订单失败：未获取到订单ID');
    }
    
    const orderId = orderResponse.data.order.id;
    console.log(`订单创建成功，订单号：${orderId}`);
    
    // 5. 支付订单
    console.log('5. 支付订单...');
    await api.post(`/orders/${orderId}/pay`);
    console.log('订单支付成功');
    
    // 6. 检查订单确认邮件
    console.log('6. 检查订单确认邮件...');
    const emailsBeforeShip = await api.post('/email', {
      email: USER_EMAIL
    });
    
    console.log(`创建订单后邮件数量：${emailsBeforeShip.data.length}`);
    emailsBeforeShip.data.forEach(email => {
      console.log(`- ${email.subject}`);
    });
    
    // 7. 确认发货（需要管理员权限，先退出登录）
    console.log('7. 确认发货...');
    delete api.defaults.headers.common['Authorization'];
    
    // 使用管理员账号登录
    const adminLoginResponse = await api.post('/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    });
    
    api.defaults.headers.common['Authorization'] = `Bearer ${adminLoginResponse.data.token}`;
    
    await api.post(`/orders/${orderId}/ship`);
    console.log('订单确认发货成功');
    
    // 8. 检查发货通知邮件
    console.log('8. 检查发货通知邮件...');
    const emailsAfterShip = await api.post('/email', {
      email: USER_EMAIL
    });
    
    console.log(`确认发货后邮件数量：${emailsAfterShip.data.length}`);
    emailsAfterShip.data.forEach(email => {
      console.log(`- ${email.subject}`);
    });
    
    // 9. 验证所有邮件
    if (emailsAfterShip.data.length >= 2) {
      console.log('✅ 测试成功！已收到订单确认邮件和发货通知邮件');
    } else {
      console.log('❌ 测试失败！未收到预期的邮件数量');
    }
    
    console.log('=== 邮件流程测试完成 ===');
    
  } catch (error) {
    console.error('测试过程中发生错误：', error.message);
    if (error.response) {
      console.error('错误响应：', error.response.data);
    }
  }
}

// 执行测试
testEmailFlow();