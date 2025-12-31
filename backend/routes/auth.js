const express = require('express');
const router = express.Router();
const { User } = require('../models');
const { generateToken, authMiddleware } = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    
    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }
    
    // 创建新用户
    const user = await User.create({
      name,
      email,
      password,
      phone,
      address
    });
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    // 返回用户信息和令牌
    res.status(201).json({
      message: '注册成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('注册失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '邮箱或密码错误' });
    }
    
    // 生成JWT令牌
    const token = generateToken(user);
    
    // 返回用户信息和令牌
    res.json({
      message: '登录成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('登录失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取当前用户信息
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'createdAt']
    });
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('获取用户信息失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更新用户信息
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 更新用户信息
    await user.update({ name, phone, address });
    
    res.json({
      message: '用户信息更新成功',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role
      }
    });
  } catch (error) {
    console.error('更新用户信息失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 更改密码
router.put('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 验证旧密码
    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '旧密码错误' });
    }
    
    // 更新密码
    await user.update({ password: newPassword });
    
    res.json({ message: '密码更改成功' });
  } catch (error) {
    console.error('更改密码失败：', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

module.exports = router;