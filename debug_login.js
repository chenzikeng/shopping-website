const express = require('express');
const app = express();

// 启用CORS
const cors = require('cors');
app.use(cors());

// 解析JSON请求体
app.use(express.json());

// 调试中间件 - 打印所有请求信息
app.use((req, res, next) => {
    console.log('=== 请求信息 ===');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', JSON.stringify(req.body));
    console.log('Query:', req.query);
    console.log('================');
    next();
});

// 登录路由
app.post('/api/auth/login', (req, res) => {
    console.log('=== 登录请求处理 ===');
    console.log('Request body:', JSON.stringify(req.body));
    
    const { email, password } = req.body;
    
    if (!email || !password) {
        console.log('缺少参数 - email:', email, 'password:', password);
        return res.status(400).json({ 
            message: '缺少必要参数', 
            received: { email, password },
            bodyKeys: Object.keys(req.body)
        });
    }
    
    console.log('接收到参数 - email:', email, 'password:', password);
    res.json({ 
        message: '测试成功', 
        received: { email, password },
        test: true
    });
});

// 根路径
app.get('/', (req, res) => {
    res.send('调试服务器运行中...');
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`调试服务器运行在 http://localhost:${PORT}`);
});