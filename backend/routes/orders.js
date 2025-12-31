const express = require('express');
const router = express.Router();
const { Order, OrderItem, Cart, Product, User } = require('../models');
const { authMiddleware } = require('../middleware/auth');
const { sendOrderConfirmation, sendShipmentNotification } = require('../services/emailService');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// 发送邮件函数
async function sendEmail(to, subject, text) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      text: text
    };

    await transporter.sendMail(mailOptions);
    console.log('邮件发送成功');
  } catch (error) {
    console.error('发送邮件失败：', error);
  }
}

// 创建订单
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;
    
    // 获取购物车列表
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [Product]
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ message: '购物车为空，无法创建订单' });
    }
    
    // 计算订单总价
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.Product.price);
    }, 0);
    
    // 创建订单
    const order = await Order.create({
      userId: req.user.id,
      totalAmount: totalAmount.toFixed(2),
      shippingAddress,
      paymentMethod
    });
    
    // 创建订单项
    const orderItems = [];
    for (const item of cartItems) {
      const orderItem = await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.Product.price
      });
      
      // 添加产品信息到订单项
      orderItem.Product = item.Product;
      orderItems.push(orderItem);
      
      // 减少产品库存
      await item.Product.decrement('stock', { by: item.quantity });
    }
    
    // 清空购物车
    await Cart.destroy({ where: { userId: req.user.id } });
    
    // 发送订单确认邮件
    await sendOrderConfirmation(req.user, order, orderItems);
    
    res.status(201).json({
      message: '订单创建成功',
      order,
      orderItems
    });
  } catch (error) {
    console.error('创建订单失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取订单列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('获取订单列表失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取订单详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    // 检查是否为当前用户的订单
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: '无权查看该订单' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('获取订单详情失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取订单历史
router.get('/history/all', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [Product]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.json(orders);
  } catch (error) {
    console.error('获取订单历史失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 支付订单
router.post('/:id/pay', authMiddleware, async (req, res) => {
  console.log('收到支付请求:', req.params.id);
  console.log('当前用户:', req.user.id, req.user.email);
  
  try {
    // 简化支付流程，只更新订单状态
    const order = await Order.findByPk(req.params.id);
    console.log('找到订单:', order);
    
    if (!order) {
      console.log('订单不存在:', req.params.id);
      return res.status(404).json({ message: '订单不存在' });
    }
    
    // 检查是否为当前用户的订单
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      console.log('用户无权操作该订单:', req.user.id, order.userId);
      return res.status(403).json({ message: '无权操作该订单' });
    }
    
    // 检查订单状态是否为待付款
    if (order.status !== 'pending') {
      console.log('订单状态不正确:', order.status);
      return res.status(400).json({ message: '该订单已支付或已取消' });
    }
    
    // 模拟支付处理 - 直接更新订单状态
    const paymentId = 'PAY_' + Math.random().toString(36).substr(2, 9) + Date.now();
    console.log('生成支付ID:', paymentId);
    
    // 更新订单状态
    await order.update({
      status: 'paid',
      paymentId: paymentId,
      paidAt: new Date()
    });
    console.log('订单状态已更新为已支付');
    
    // 获取订单详情和用户信息
    const orderDetails = await Order.findByPk(order.id, {
      include: [{ model: OrderItem, include: [Product] }, User]
    });
    
    // 发送订单确认邮件
    await sendOrderConfirmation(orderDetails.User, order);
    
    console.log('支付成功，准备返回响应');
    res.json({ 
      message: '支付成功',
      orderId: order.id,
      paymentId: paymentId
    });
  } catch (error) {
    console.error('支付失败：', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ message: '支付失败', error: error.message });
  }
});

// 确认发货（管理员功能）
router.post('/:id/ship', authMiddleware, async (req, res) => {
  try {
    // 检查用户是否为管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '只有管理员可以执行此操作' });
    }

    // 查找订单
    const order = await Order.findByPk(req.params.id, {
      include: [User, { model: OrderItem, include: [Product] }] // 包含用户和订单项信息以便发送邮件
    });

    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }

    // 检查订单状态是否为已支付
    if (order.status !== 'paid') {
      return res.status(400).json({ message: '只有已支付的订单才能发货' });
    }

    // 更新订单状态为已发货
    await order.update({
      status: 'shipped',
      shippedAt: new Date()
    });

    // 发送发货通知邮件
    await sendShipmentNotification(order.User, order);

    res.json({ 
      message: '订单已确认发货',
      orderId: order.id
    });
  } catch (error) {
    console.error('确认发货失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;