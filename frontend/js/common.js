// 检查用户是否已登录
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// 获取认证token
function getToken() {
    return localStorage.getItem('token');
}

// 获取当前用户信息
function getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// 检查用户是否为管理员
function isAdmin() {
    const user = getUser();
    return user ? user.role === 'admin' : false;
}

// 发送请求时添加认证头
async function fetchWithAuth(url, options = {}) {
    const token = getToken();
    
    if (!options.headers) {
        options.headers = {};
    }
    
    options.headers['Authorization'] = `Bearer ${token}`;
    
    if (!options.headers['Content-Type'] && options.body) {
        options.headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, options);
    
    // 如果响应状态码为401（未授权），重定向到登录页面
    if (response.status === 401) {
        logout();
        return Promise.reject(new Error('未授权'));
    }
    
    return response;
}

// 显示消息函数
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${type}`;
    messageDiv.textContent = message;
    
    const container = document.querySelector('.container') || document.querySelector('.admin-container') || document.body;
    container.insertBefore(messageDiv, container.firstChild);
    
    // 3秒后移除消息
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// 更新购物车数量显示
async function updateCartCount() {
    const cartCountElement = document.getElementById('cartCount');
    if (!cartCountElement) return;
    
    if (!isLoggedIn()) {
        cartCountElement.textContent = '0';
        return;
    }
    
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/cart');
        if (response.ok) {
            const data = await response.json();
            const totalCount = data.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCountElement.textContent = totalCount;
        }
    } catch (error) {
        console.error('更新购物车数量失败:', error);
    }
}

// 页面加载时检查登录状态
window.addEventListener('DOMContentLoaded', function() {
    // 如果需要登录才能访问的页面，检查登录状态
    const protectedPages = ['index.html', 'cart.html', 'orders.html', 'admin.html', 'admin-orders.html', 'admin-reports.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    // 如果是管理员页面，检查是否为管理员
    const adminPages = ['admin.html', 'admin-orders.html', 'admin-reports.html'];
    if (adminPages.includes(currentPage) && !isAdmin()) {
        window.location.href = 'index.html';
        return;
    }
    
    // 更新购物车数量
    updateCartCount();
    
    // 退出登录按钮
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            logout();
        });
    }
});

// 退出登录函数
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}