const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { Op } = require('sequelize');

// 获取产品列表
router.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    // 构建查询条件
    const where = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    
    // 获取产品列表和总数
    const { count, rows: products } = await Product.findAndCountAll({
      where,
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
    console.error('获取产品列表失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取单个产品详情
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('获取产品详情失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 按分类获取产品
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: { category },
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
    console.error('按分类获取产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 搜索产品
router.get('/search/:keyword', async (req, res) => {
  try {
    const { keyword } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        [Op.or]: [
          { name: { [Op.like]: `%${keyword}%` } },
          { description: { [Op.like]: `%${keyword}%` } }
        ]
      },
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
    console.error('搜索产品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;