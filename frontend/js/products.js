// 页面加载时获取产品列表
window.addEventListener('DOMContentLoaded', function() {
    fetchProducts();
    
    // 搜索按钮点击事件
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value;
            searchProducts(searchTerm);
        });
    }
    
    // 搜索输入框回车事件
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = searchInput.value;
                searchProducts(searchTerm);
            }
        });
    }
});

// 获取产品列表
async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products); // 从响应对象中提取products数组
        }
    } catch (error) {
        console.error('获取产品列表失败:', error);
        showMessage('获取产品列表失败，请稍后重试', 'error');
    }
}

// 搜索产品
async function searchProducts(searchTerm) {
    try {
        const url = searchTerm ? `http://localhost:3000/api/products/search/${encodeURIComponent(searchTerm)}` : 'http://localhost:3000/api/products';
        const response = await fetch(url);
        
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products); // 从响应对象中提取products数组
        }
    } catch (error) {
        console.error('搜索产品失败:', error);
        showMessage('搜索产品失败，请稍后重试', 'error');
    }
}

// 展示产品列表
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>没有找到产品</h3>
                <p>请尝试其他搜索条件</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-card">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 150px; height: 150px; object-fit: cover; margin-bottom: 10px;">` : ''}
            <h3>${product.name}</h3>
            <p class="price">¥${parseFloat(product.price).toFixed(2)}</p>
            <p class="description">${product.description}</p>
            <p class="stock">库存: ${product.stock}</p>
            <button 
                onclick="addToCart(${product.id})" 
                ${product.stock <= 0 ? 'disabled' : ''}
            >
                ${product.stock <= 0 ? '库存不足' : '加入购物车'}
            </button>
        </div>
    `).join('');
}

// 添加产品到购物车
async function addToCart(productId) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 })
        });
        
        if (response.ok) {
            showMessage('产品已添加到购物车', 'success');
            // 更新购物车数量
            updateCartCount();
        } else {
            const data = await response.json();
            showMessage('添加购物车失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('添加购物车失败:', error);
        showMessage('添加购物车失败，请稍后重试', 'error');
    }
}