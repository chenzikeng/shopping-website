// 直接测试虚拟邮件服务内部功能
console.log('=== 直接测试虚拟邮件服务 ===');

// 导入虚拟邮件服务
const emailService = require('./backend/routes/email');
const virtualEmailService = emailService.sendVirtualEmail;

// 直接导入虚拟邮件存储
const fs = require('fs');
const path = require('path');

// 直接读取email.js文件内容，提取虚拟邮件存储
const emailJsContent = fs.readFileSync('./backend/routes/email.js', 'utf8');

// 测试发送邮件
async function testEmailSending() {
  try {
    console.log('1. 测试发送邮件...');
    const email = await virtualEmailService(
      'noreply@onlineshop.com',
      'test@example.com',
      '订单确认邮件',
      '<h1>订单已确认</h1><p>您的订单已成功创建</p>'
    );
    
    console.log('📧 邮件发送成功:', email);
    
    // 再次发送一封发货通知邮件
    const shipEmail = await virtualEmailService(
      'noreply@onlineshop.com',
      'test@example.com',
      '发货通知邮件',
      '<h1>订单已发货</h1><p>您的订单已成功发货</p>'
    );
    
    console.log('📧 发货通知邮件发送成功:', shipEmail);
    
    console.log('\n✅ 虚拟邮件服务功能正常！');
    console.log('\n测试完成：');
    console.log('1. 已发送2封测试邮件到虚拟存储');
    console.log('2. 邮件接收地址：test@example.com');
    console.log('3. 邮件主题：订单确认邮件、发货通知邮件');
    
    console.log('\n📋 如何查看邮件：');
    console.log('1. 在浏览器中打开 frontend/email.html');
    console.log('2. 输入邮箱：test@example.com');
    console.log('3. 点击"检查邮件"按钮查看发送的邮件');
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 执行测试
testEmailSending();