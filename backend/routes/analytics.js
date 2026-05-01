const express = require('express');
const router = express.Router();
const { Op, fn, col, literal } = require('sequelize');
const jwt = require('jsonwebtoken');
const { Product, Order, OrderItem, User, Category, LoginLog, BrowseLog, OperationLog } = require('../models');
const { authMiddleware, salesOrAdminMiddleware, adminMiddleware } = require('../middleware/auth');

const startDate = days => {
  const date = new Date();
  date.setDate(date.getDate() - Number(days || 30));
  return date;
};
const periodFormat = period => period === 'week' ? '%x年第%v周' : period === 'month' ? '%Y-%m' : '%Y-%m-%d';

router.post('/browse', async (req, res) => {
  try {
    const { productId, durationSeconds = 0 } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: '产品不存在' });
    let userId = null;
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
      try { userId = jwt.verify(token, process.env.JWT_SECRET).id; } catch (error) { userId = null; }
    }
    await BrowseLog.create({ userId, productId: product.id, category: product.category, durationSeconds: Math.max(0, parseInt(durationSeconds) || 0), ipAddress: req.ip });
    res.json({ message: '浏览记录已保存' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const { productId, limit = 4 } = req.query;
    let products = [];
    if (productId) {
      const current = await Product.findByPk(productId);
      if (current) {
        const orderRows = await OrderItem.findAll({ attributes: ['orderId'], where: { productId }, raw: true });
        const orderIds = orderRows.map(row => row.orderId);
        if (orderIds.length) {
          const rows = await OrderItem.findAll({
            attributes: ['productId', [fn('SUM', literal('`OrderItem`.`quantity`')), 'score']],
            where: { orderId: { [Op.in]: orderIds }, productId: { [Op.ne]: productId } },
            include: [Product], group: ['productId', 'Product.id'], order: [[literal('score'), 'DESC']], limit: parseInt(limit)
          });
          products = rows.map(row => row.Product);
        }
        if (products.length < parseInt(limit)) {
          const more = await Product.findAll({ where: { category: current.category, id: { [Op.ne]: current.id } }, limit: parseInt(limit) - products.length });
          products = products.concat(more);
        }
      }
    }
    if (!products.length) {
      const rows = await OrderItem.findAll({ attributes: ['productId', [fn('SUM', literal('`OrderItem`.`quantity`')), 'score']], include: [Product], group: ['productId', 'Product.id'], order: [[literal('score'), 'DESC']], limit: parseInt(limit) });
      products = rows.map(row => row.Product);
    }
    res.json({ products: products.filter(Boolean).slice(0, parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { userId: req.user.id }, include: [{ model: OrderItem, include: [Product] }] });
    const browseLogs = await BrowseLog.findAll({ where: { userId: req.user.id } });
    const scores = {};
    let totalSpent = 0;
    let totalItems = 0;
    orders.forEach(order => {
      totalSpent += parseFloat(order.totalAmount);
      order.OrderItems.forEach(item => {
        scores[item.Product.category] = (scores[item.Product.category] || 0) + item.quantity * 5;
        totalItems += item.quantity;
      });
    });
    browseLogs.forEach(log => { scores[log.category] = (scores[log.category] || 0) + 1 + Math.min(log.durationSeconds / 30, 3); });
    const preferredCategories = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([category, score]) => ({ category, score: Number(score.toFixed(2)) }));
    const avg = orders.length ? totalSpent / orders.length : 0;
    const purchasingPower = avg >= 1000 || totalSpent >= 5000 ? '高' : avg >= 300 || totalSpent >= 1000 ? '中' : '低';
    res.json({ region: req.user.address ? req.user.address.slice(0, 12) : '未知', purchasingPower, totalSpent: totalSpent.toFixed(2), totalOrders: orders.length, totalItems, preferredCategories });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/sales-trends', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const { period = 'day', days = 30 } = req.query;
    const rows = await Order.findAll({
      attributes: [[fn('DATE_FORMAT', col('createdAt'), periodFormat(period)), 'period'], [fn('COUNT', col('id')), 'orders'], [fn('SUM', col('totalAmount')), 'sales']],
      where: { createdAt: { [Op.gte]: startDate(days) }, status: { [Op.ne]: 'cancelled' } },
      group: [literal('period')], order: [[literal('period'), 'ASC']], raw: true
    });
    res.json({ period, rows });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/leaderboard', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const rows = await OrderItem.findAll({
      attributes: ['productId', [fn('SUM', literal('`OrderItem`.`quantity`')), 'quantity'], [fn('SUM', literal('`OrderItem`.`quantity` * `OrderItem`.`price`')), 'revenue']],
      include: [{ model: Product, attributes: ['id', 'name', 'category', 'stock'] }],
      group: ['productId', 'Product.id'], order: [[literal('quantity'), 'DESC']], limit: 10
    });
    res.json({ rows });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/monitor', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const lowStockProducts = await Product.findAll({ where: { stock: { [Op.lte]: 5 } }, order: [['stock', 'ASC']], limit: 20 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.count({ where: { createdAt: { [Op.gte]: today } } });
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const cancelledOrders = await Order.count({ where: { status: 'cancelled', createdAt: { [Op.gte]: startDate(7) } } });
    const activeOrders = await Order.count({ where: { status: { [Op.ne]: 'cancelled' }, createdAt: { [Op.gte]: startDate(7) } } });
    const cancelRate = activeOrders + cancelledOrders ? cancelledOrders / (activeOrders + cancelledOrders) : 0;
    const alerts = lowStockProducts.map(product => ({ type: 'low_stock', level: 'warning', message: `${product.name} 库存偏低：${product.stock}` }));
    if (pendingOrders > 20) alerts.push({ type: 'pending_orders', level: 'warning', message: `待付款订单较多：${pendingOrders}` });
    if (cancelRate > 0.3) alerts.push({ type: 'cancel_rate', level: 'danger', message: `近7天取消率偏高：${(cancelRate * 100).toFixed(1)}%` });
    res.json({ todayOrders, pendingOrders, cancelRate: Number((cancelRate * 100).toFixed(1)), lowStockProducts, alerts });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/forecast', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const history = await Order.findAll({ attributes: [[fn('DATE_FORMAT', col('createdAt'), '%Y-%m-%d'), 'date'], [fn('SUM', col('totalAmount')), 'sales']], where: { createdAt: { [Op.gte]: startDate(14) }, status: { [Op.ne]: 'cancelled' } }, group: [literal('date')], order: [[literal('date'), 'ASC']], raw: true });
    const values = history.map(row => parseFloat(row.sales || 0));
    const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
    const recent = values.slice(-3);
    const recentAverage = recent.length ? recent.reduce((sum, value) => sum + value, 0) / recent.length : average;
    const nextDayPrediction = ((average * 0.4) + (recentAverage * 0.6)).toFixed(2);
    res.json({ history, nextDayPrediction, evaluation: Number(nextDayPrediction) >= average ? '预计销售稳定或增长' : '预计销售可能下降' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;

