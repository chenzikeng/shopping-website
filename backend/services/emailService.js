const nodemailer = require('nodemailer');
require('dotenv').config();

// 检查是否使用真实SMTP配置
const isRealSMTP = process.env.EMAIL_HOST && process.env.EMAIL_HOST !== 'smtp.example.com';

// 创建邮件传输器
const transporter = isRealSMTP ? nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_PORT === 465, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
}) : null;

// 导入虚拟邮件服务（如果需要）
let virtualEmailService = null;
if (!isRealSMTP) {
  try {
    const emailModule = require('../routes/email');
    // 确保只使用sendVirtualEmail函数
    if (emailModule.sendVirtualEmail && typeof emailModule.sendVirtualEmail === 'function') {
      virtualEmailService = emailModule.sendVirtualEmail;
    } else {
      console.error('虚拟邮件服务导入失败：未找到sendVirtualEmail函数');
    }
  } catch (error) {
    console.error('无法加载虚拟邮件服务:', error);
  }
}

// 发送订单确认邮件
exports.sendOrderConfirmation = async (user, order, orderItems = null) => {
  try {
    // 使用传入的orderItems或order.OrderItems
    const itemsToDisplay = orderItems || (order.OrderItems || []);
    
    // 构建邮件内容
    const from = isRealSMTP ? process.env.EMAIL_USER : 'noreply@onlineshop.com';
    const subject = '订单确认 - 在线购物网站';
    const html = `
      <h1>感谢您的订单！</h1>
      <p>尊敬的 ${user.name}，</p>
      <p>我们已经收到您的订单，订单号为：${order.id}</p>
      <h3>订单详情：</h3>
      <ul>
        ${itemsToDisplay.map(item => `
          <li>${item.Product ? item.Product.name : '产品名称'} - 数量: ${item.quantity} - 单价: ${item.price || (item.Product ? item.Product.price : '0')}元</li>
        `).join('')}
      </ul>
      <p>订单总额：${order.totalAmount}元</p>
      <p>订单状态：${order.status === 'pending' ? '待支付' : order.status === 'paid' ? '已支付' : order.status}</p>
      <p>预计发货时间：3-5个工作日</p>
      <p>如有任何问题，请随时联系我们。</p>
      <p>祝您购物愉快！</p>
      <p>在线购物网站</p>
    `;

    if (isRealSMTP && transporter) {
      // 使用真实SMTP发送邮件
      const mailOptions = {
        from,
        to: user.email,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('订单确认邮件已发送:', info.messageId);
    } else if (virtualEmailService) {
      // 使用虚拟邮件服务
      await virtualEmailService(from, user.email, subject, html);
      console.log('虚拟订单确认邮件已发送:', subject);
    } else {
      // 记录到控制台
      console.log('订单确认邮件内容（未发送）:');
      console.log(`发件人: ${from}`);
      console.log(`收件人: ${user.email}`);
      console.log(`主题: ${subject}`);
      console.log(`内容: ${html}`);
    }

    return true;
  } catch (error) {
    console.error('发送订单确认邮件失败:', error);
    return false;
  }
};

// 发送发货通知邮件
exports.sendShipmentNotification = async (user, order, orderItems = null) => {
  try {
    // 使用传入的orderItems或order.OrderItems
    const itemsToDisplay = orderItems || (order.OrderItems || []);
    
    // 构建邮件内容
    const from = isRealSMTP ? process.env.EMAIL_USER : 'noreply@onlineshop.com';
    const subject = '发货通知 - 在线购物网站';
    const html = `
      <h1>您的订单已发货！</h1>
      <p>尊敬的 ${user.name}，</p>
      <p>您的订单（订单号：${order.id}）已发货。</p>
      <h3>订单详情：</h3>
      <ul>
        ${itemsToDisplay.map(item => `
          <li>${item.Product ? item.Product.name : '产品名称'} - 数量: ${item.quantity} - 单价: ${item.price || (item.Product ? item.Product.price : '0')}元</li>
        `).join('')}
      </ul>
      <p>订单总额：${order.totalAmount}元</p>
      <p>发货时间：${order.shippedAt ? new Date(order.shippedAt).toLocaleString('zh-CN') : '待定'}</p>
      <p>预计送达时间：5-7个工作日</p>
      <p>订单状态：${order.status}</p>
      <p>感谢您的购买！</p>
      <p>如有任何问题，请随时联系我们。</p>
      <p>在线购物网站团队</p>
    `;

    if (isRealSMTP && transporter) {
      // 使用真实SMTP发送邮件
      const mailOptions = {
        from,
        to: user.email,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('发货通知邮件已发送:', info.messageId);
    } else if (virtualEmailService) {
      // 使用虚拟邮件服务
      await virtualEmailService(from, user.email, subject, html);
      console.log('虚拟发货通知邮件已发送:', subject);
    } else {
      // 记录到控制台
      console.log('发货通知邮件内容（未发送）:');
      console.log(`发件人: ${from}`);
      console.log(`收件人: ${user.email}`);
      console.log(`主题: ${subject}`);
      console.log(`内容: ${html}`);
    }

    return true;
  } catch (error) {
    console.error('发送发货通知邮件失败:', error);
    return false;
  }
};