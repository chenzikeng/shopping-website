const express = require('express');
const router = express.Router();
const { User, Product, Category, LoginLog, BrowseLog, OperationLog } = require('../models');
const { authMiddleware, salesOrAdminMiddleware, adminMiddleware } = require('../middleware/auth');

router.get('/logs/login', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const logs = await LoginLog.findAll({ include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }], order: [['createdAt', 'DESC']], limit: 100 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/logs/browse', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const logs = await BrowseLog.findAll({ include: [{ model: User, attributes: ['id', 'name', 'email'] }, Product], order: [['createdAt', 'DESC']], limit: 100 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/logs/operations', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const logs = await OperationLog.findAll({ include: [{ model: User, attributes: ['id', 'name', 'email', 'role'] }], order: [['createdAt', 'DESC']], limit: 100 });
    res.json({ logs });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['createdAt', 'DESC']] });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.post('/categories', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const category = await Category.create(req.body);
    await OperationLog.create({ userId: req.user.id, account: req.user.email, role: req.user.role, action: '添加商品类别', content: category.name, ipAddress: req.ip });
    res.status(201).json({ message: '类别添加成功', category });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.delete('/categories/:id', [authMiddleware, salesOrAdminMiddleware], async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ message: '类别不存在' });
    await OperationLog.create({ userId: req.user.id, account: req.user.email, role: req.user.role, action: '删除商品类别', content: category.name, ipAddress: req.ip });
    await category.destroy();
    res.json({ message: '类别删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.post('/sales-users', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) return res.status(400).json({ message: '该邮箱已存在' });
    const user = await User.create({ name, email, password, phone, role: 'sales' });
    await OperationLog.create({ userId: req.user.id, account: req.user.email, role: req.user.role, action: '添加销售人员', content: email, ipAddress: req.ip });
    res.status(201).json({ message: '销售人员添加成功', user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.get('/sales-users', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const users = await User.findAll({ where: { role: 'sales' }, attributes: ['id', 'name', 'email', 'phone', 'role', 'createdAt'], order: [['createdAt', 'DESC']] });
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.delete('/sales-users/:id', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const user = await User.findOne({ where: { id: req.params.id, role: 'sales' } });
    if (!user) return res.status(404).json({ message: '销售人员不存在' });
    await OperationLog.create({ userId: req.user.id, account: req.user.email, role: req.user.role, action: '删除销售人员', content: user.email, ipAddress: req.ip });
    await user.destroy();
    res.json({ message: '销售人员删除成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

router.put('/sales-users/:id/reset-password', [authMiddleware, adminMiddleware], async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findOne({ where: { id: req.params.id, role: 'sales' } });
    if (!user) return res.status(404).json({ message: '销售人员不存在' });
    await user.update({ password });
    await OperationLog.create({ userId: req.user.id, account: req.user.email, role: req.user.role, action: '重置销售人员密码', content: user.email, ipAddress: req.ip });
    res.json({ message: '密码重置成功' });
  } catch (error) {
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;
