// 登录表单提交事件
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        login(email, password);
    });
}

// 注册表单提交事件
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const phone = document.getElementById('phone').value;
        const address = document.getElementById('address').value;
        
        register(name, email, password, phone, address);
    });
}

// 退出登录按钮点击事件
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
    });
}

// 获取API基础URL的函数
function getApiBaseUrl() {
    // 如果是在localhost访问，使用localhost:3000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000';
    }
    // 如果是在其他域名访问，使用当前域名
    return `${window.location.origin}`;
}

// 登录函数
async function login(email, password) {
    try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // 保存token到localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // 跳转到首页
            window.location.href = 'index.html';
        } else {
            showMessage('登录失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('登录错误:', error);
        showMessage('登录失败：网络错误', 'error');
    }
}

// 注册函数
async function register(name, email, password, phone, address) {
    try {
        const apiBaseUrl = getApiBaseUrl();
        const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, phone, address })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showMessage('注册成功，请登录', 'success');
            // 跳转到登录页面
            window.location.href = 'login.html';
        } else {
            showMessage('注册失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('注册错误:', error);
        showMessage('注册失败：网络错误', 'error');
    }
}

// 退出登录函数
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// 显示消息函数
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3秒后移除消息
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}