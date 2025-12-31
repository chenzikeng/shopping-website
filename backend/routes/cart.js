const express = require('express');
const router = express.Router();
const { Cart, Product } = require('../models');
const { authMiddleware } = require('../middleware/auth');

// 获取购物车列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [Product],
      order: [['createdAt', 'DESC']]
    });
    
    // 计算购物车总价
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.quantity * item.Product.price);
    }, 0);
    
    res.json({
      cartItems,
      totalPrice: totalPrice.toFixed(2)
    });
  } catch (error) {
    console.error('获取购物车列表失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 添加商品到购物车
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    // 检查产品是否存在
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: '产品不存在' });
    }
    
    // 检查购物车中是否已存在该商品
    let cartItem = await Cart.findOne({
      where: { userId: req.user.id, productId }
    });
    
    if (cartItem) {
      // 如果存在，增加数量
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // 如果不存在，创建新的购物车项
      cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity
      });
    }
    
    res.json({ message: '商品已添加到购物车', cartItem });
  } catch (error) {
    console.error('添加商品到购物车失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新购物车商品数量
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findByPk(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }
    
    // 检查是否为当前用户的购物车商品
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: '无权操作该购物车商品' });
    }
    
    // 更新数量
    await cartItem.update({ quantity });
    
    res.json({ message: '购物车商品数量已更新', cartItem });
  } catch (error) {
    console.error('更新购物车商品数量失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除购物车商品
router.delete('/remove/:id', authMiddleware, async (req, res) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    
    if (!cartItem) {
      return res.status(404).json({ message: '购物车商品不存在' });
    }
    
    // 检查是否为当前用户的购物车商品
    if (cartItem.userId !== req.user.id) {
      return res.status(403).json({ message: '无权操作该购物车商品' });
    }
    
    // 删除购物车商品
    await cartItem.destroy();
    
    res.json({ message: '购物车商品已删除' });
  } catch (error) {
    console.error('删除购物车商品失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 清空购物车
router.delete('/clear', authMiddleware, async (req, res) => {
  try {
    // 删除当前用户的所有购物车商品
    await Cart.destroy({ where: { userId: req.user.id } });
    
    res.json({ message: '购物车已清空' });
  } catch (error) {
    console.error('清空购物车失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;