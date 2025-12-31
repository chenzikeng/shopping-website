const express = require('express');
const router = express.Router();
const { Product, Order, OrderItem, User } = require('../models');
const { Op } = require('sequelize');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { sendShipmentNotification } = require('../services/emailService');

// 产品管理

// 添加产品
router.post('/products', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    
    const product = await Product.create({
      name,
      description,
      price,
      stock,
      category,
      image
    });
    
    res.status(201).json({ message: '产品添加成功', product });
  } catch (error) {
    console.error('添加产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取所有产品
router.get('/products', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    console.error('获取所有产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新产品
router.put('/products/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { name, description, price, stock, category, image } = req.body;
    
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    await product.update({
      name,
      description,
      price,
      stock,
      category,
      image
    });
    
    res.json({ message: '产品更新成功', product });
  } catch (error) {
    console.error('更新产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除产品
router.delete('/products/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    await product.destroy();
    
    res.json({ message: '产品删除成功' });
  } catch (error) {
    console.error('删除产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 订单管理

// 获取所有订单
router.get('/orders', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) {
      where.status = status;
    }
    
    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'name', 'email']
      }, {
        model: OrderItem,
        include: [Product]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    console.error('获取所有订单失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新订单状态
router.put('/orders/:id/status', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { status } = req.body;
    
    const order = await Order.findByPk(req.params.id, {
      include: [User]
    });
    
    if (!order) {
      return res.status(404).json({ message: '订单不存在' });
    }
    
    await order.update({ status });
    
    // 如果订单状态改为已发货，发送发货通知邮件
    if (status === 'shipped') {
      await sendShipmentNotification(order.User, order);
    }
    
    res.json({ message: '订单状态更新成功', order });
  } catch (error) {
    console.error('更新订单状态失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 销售统计报表

// 获取销售统计
router.get('/statistics', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // 构建日期查询条件
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }
    
    // 获取订单统计数据
    const orders = await Order.findAll({
      where,
      include: [OrderItem]
    });
    
    // 计算总销售额
    const totalSales = orders.reduce((sum, order) => {
      return sum + parseFloat(order.totalAmount);
    }, 0);
    
    // 计算订单总数
    const totalOrders = orders.length;
    
    // 计算平均订单金额
    const averageOrderAmount = totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
    
    // 获取最畅销产品
    const productSales = {};
    orders.forEach(order => {
      order.OrderItems.forEach(item => {
        if (productSales[item.productId]) {
          productSales[item.productId].quantity += item.quantity;
          productSales[item.productId].revenue += (item.quantity * item.price);
        } else {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.Product.name,
            quantity: item.quantity,
            revenue: (item.quantity * item.price)
          };
        }
      });
    });
    
    const bestSellingProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    res.json({
      totalSales: totalSales.toFixed(2),
      totalOrders,
      averageOrderAmount,
      bestSellingProducts,
      dateRange: {
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('获取销售统计失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取用户列表
router.get('/users', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: users } = await User.findAndCountAll({
      attributes: ['id', 'name', 'email', 'role', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalItems: count
    });
  } catch (error) {
    console.error('获取用户列表失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;