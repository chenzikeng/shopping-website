const express = require('express');
const router = express.Router();

// 虚拟邮件存储（内存中）
let virtualEmails = [];

// 获取指定邮箱的邮件
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: '请提供邮箱地址' });
    }
    
    // 查找该邮箱的所有邮件
    const userEmails = virtualEmails.filter(mail => mail.to === email);
    
    res.json(userEmails);
  } catch (error) {
    console.error('获取邮件失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 发送虚拟邮件（用于内部调用）
router.post('/send', async (req, res) => {
  try {
    const { from, to, subject, body } = req.body;
    
    if (!from || !to || !subject || !body) {
      return res.status(400).json({ message: '缺少必要的邮件信息' });
    }
    
    // 创建新邮件
    const newEmail = {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      from,
      to,
      subject,
      body,
      timestamp: new Date().toLocaleString('zh-CN')
    };
    
    // 保存邮件到虚拟存储
    virtualEmails.push(newEmail);
    
    res.status(201).json({ message: '虚拟邮件发送成功', email: newEmail });
  } catch (error) {
    console.error('发送虚拟邮件失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 清除所有虚拟邮件（用于测试）
router.delete('/clear', async (req, res) => {
  try {
    virtualEmails = [];
    res.json({ message: '所有虚拟邮件已清除' });
  } catch (error) {
    console.error('清除虚拟邮件失败:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 导出虚拟邮件发送函数（供其他模块使用）
module.exports = router;
module.exports.sendVirtualEmail = async (from, to, subject, body) => {
  const newEmail = {
    id: Date.now() + Math.random().toString(36).substr(2, 9),
    from,
    to,
    subject,
    body,
    timestamp: new Date().toLocaleString('zh-CN')
  };
  
  virtualEmails.push(newEmail);
  console.log(`虚拟邮件已发送到 ${to}: ${subject}`);
  return newEmail;
};