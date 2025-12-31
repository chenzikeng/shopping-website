// 模拟用户登录
const mockLogin = () => {
    // 模拟token
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NjU0NjUwODQsImV4cCI6MTc2NTQ2ODY4NH0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    
    // 模拟用户信息
    const user = {
        id: 1,
        username: 'admin',
        role: 'admin'
    };
    
    // 将token和用户信息保存到localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    console.log('模拟登录成功，token已保存到localStorage');
};

// 检查localStorage中的token
const checkLogin = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('token:', token);
    console.log('user:', user);
    
    if (token && user) {
        console.log('用户已登录');
    } else {
        console.log('用户未登录');
    }
};

// 运行测试
document.addEventListener('DOMContentLoaded', function() {
    // 先检查当前登录状态
    console.log('当前登录状态:');
    checkLogin();
    
    // 模拟登录
    mockLogin();
    
    // 再次检查登录状态
    console.log('模拟登录后的登录状态:');
    checkLogin();
    
    // 绑定按钮事件
    document.getElementById('mockLoginBtn').addEventListener('click', mockLogin);
    document.getElementById('checkLoginBtn').addEventListener('click', checkLogin);
    document.getElementById('clearLoginBtn').addEventListener('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('已清除登录信息');
    });
});