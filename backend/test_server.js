const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 模拟用户数据
const users = [
    { id: 1, username: 'testuser', email: 'test@example.com' }
];

// 模拟商品数据
const products = [
    { id: 1, name: 'iPhone 15', price: 6999, stock: 100 },
    { id: 2, name: 'MacBook Pro', price: 15999, stock: 50 },
    { id: 3, name: 'iPad Air', price: 4399, stock: 80 }
];

// 健康检查
app.get('/', (req, res) => {
    res.json({ message: '购物网站后端API测试服务正在运行', status: 'ok' });
});

// 用户认证相关API
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    // 简单的测试登录逻辑
    if (username === 'test' && password === '123456') {
        res.json({
            success: true,
            message: '登录成功',
            token: 'mock-jwt-token-12345',
            user: { id: 1, username: 'testuser', email: 'test@example.com' }
        });
    } else {
        res.json({
            success: false,
            message: '用户名或密码错误'
        });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password } = req.body;
    
    res.json({
        success: true,
        message: '注册成功',
        user: { id: Date.now(), username, email }
    });
});

// 商品相关API
app.get('/api/products', (req, res) => {
    res.json({
        success: true,
        data: products
    });
});

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === parseInt(req.params.id));
    if (product) {
        res.json({
            success: true,
            data: product
        });
    } else {
        res.json({
            success: false,
            message: '商品不存在'
        });
    }
});

// 购物车相关API
app.get('/api/cart/:userId', (req, res) => {
    res.json({
        success: true,
        data: [] // 空的购物车
    });
});

app.post('/api/cart', (req, res) => {
    const { userId, productId, quantity } = req.body;
    
    res.json({
        success: true,
        message: '商品已添加到购物车',
        data: { userId, productId, quantity }
    });
});

// 订单相关API
app.post('/api/orders', (req, res) => {
    const { userId, items, total } = req.body;
    
    res.json({
        success: true,
        message: '订单创建成功',
        orderId: Date.now(),
        data: { userId, items, total, status: 'pending' }
    });
});

app.get('/api/orders/:userId', (req, res) => {
    res.json({
        success: true,
        data: [] // 空的订单列表
    });
});

// 管理员相关API
app.get('/api/admin/products', (req, res) => {
    res.json({
        success: true,
        data: products
    });
});

app.put('/api/admin/products/:id', (req, res) => {
    const productId = parseInt(req.params.id);
    const { name, price, stock } = req.body;
    
    const productIndex = products.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
        products[productIndex] = { ...products[productIndex], name, price, stock };
        res.json({
            success: true,
            message: '商品更新成功',
            data: products[productIndex]
        });
    } else {
        res.json({
            success: false,
            message: '商品不存在'
        });
    }
});

// 邮件相关API
app.post('/api/email/send', (req, res) => {
    const { to, subject, content } = req.body;
    
    res.json({
        success: true,
        message: '邮件发送成功',
        data: { to, subject, content }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🎉 测试后端服务启动成功！`);
    console.log(`📡 服务器运行在: http://localhost:${PORT}`);
    console.log(`🔗 健康检查: http://localhost:${PORT}/`);
    console.log('');
    console.log('📋 可用的API接口:');
    console.log('   POST /api/auth/login    - 用户登录 (用户名: test, 密码: 123456)');
    console.log('   POST /api/auth/register - 用户注册');
    console.log('   GET  /api/products      - 获取商品列表');
    console.log('   GET  /api/cart/:userId  - 获取购物车');
    console.log('   POST /api/orders        - 创建订单');
    console.log('   GET  /api/admin/products - 管理员获取商品');
    console.log('   POST /api/email/send    - 发送邮件');
    console.log('');
    console.log('✨ 现在可以测试前端功能了！');
});