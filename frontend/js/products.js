// 页面加载时获取产品列表
window.addEventListener('DOMContentLoaded', function() {
    fetchCategories();
    fetchProducts();
    fetchRecommendations();
    
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = document.getElementById('searchInput').value;
            searchProducts(searchTerm);
        });
    }
    
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

async function fetchCategories() {
    const container = document.getElementById('categoryFilterContainer');
    if (!container) return;
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/management/categories`);
        if (!response.ok) return;
        const data = await response.json();
        container.innerHTML = `
            <button class="category-filter active" onclick="filterByCategory('', this)">${translateText('全部商品')}</button>
            ${data.categories.map(category => `
                <button class="category-filter" onclick="filterByCategory('${category.name}', this)">${category.name}</button>
            `).join('')}
        `;
    } catch (error) {
        console.error('获取商品类别失败:', error);
    }
}

async function filterByCategory(category, button) {
    document.querySelectorAll('.category-filter').forEach(item => item.classList.remove('active'));
    if (button) button.classList.add('active');

    const recommendationsSection = document.getElementById('recommendationsSection');
    const productsSectionTitle = document.getElementById('productsSectionTitle');
    if (recommendationsSection) {
        recommendationsSection.style.display = category ? 'none' : 'block';
    }
    if (productsSectionTitle) {
        productsSectionTitle.textContent = category ? `${category} 商品` : '全部商品';
    }

    try {
        const url = category ? `${getApiBaseUrl()}/api/products?category=${encodeURIComponent(category)}` : `${getApiBaseUrl()}/api/products`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('按类别筛选失败:', error);
        showMessage('按类别筛选失败，请稍后重试', 'error');
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/products`);
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('获取产品列表失败:', error);
        showMessage('获取产品列表失败，请稍后重试', 'error');
    }
}

async function searchProducts(searchTerm) {
    const recommendationsSection = document.getElementById('recommendationsSection');
    const productsSectionTitle = document.getElementById('productsSectionTitle');
    if (recommendationsSection) {
        recommendationsSection.style.display = searchTerm ? 'none' : 'block';
    }
    if (productsSectionTitle) {
        productsSectionTitle.textContent = searchTerm ? `搜索结果：${searchTerm}` : '全部商品';
    }

    try {
        const url = searchTerm ? `${getApiBaseUrl()}/api/products/search/${encodeURIComponent(searchTerm)}` : `${getApiBaseUrl()}/api/products`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            displayProducts(data.products);
        }
    } catch (error) {
        console.error('搜索产品失败:', error);
        showMessage('搜索产品失败，请稍后重试', 'error');
    }
}

function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    if (products.length === 0) {
        container.innerHTML = `<div class="empty-state"><h3>${translateText('没有找到产品')}</h3><p>${translateText('请尝试其他搜索条件')}</p></div>`;
        return;
    }
    container.innerHTML = products.map(product => productCard(product)).join('');
    if (window.applyTranslations) window.applyTranslations();
}

function productCard(product) {
    return `
        <div class="product-card">
            ${product.image ? `<img src="${product.image}" alt="${product.name}" style="width: 150px; height: 150px; object-fit: cover; margin-bottom: 10px;">` : ''}
            <h3>${product.name}</h3>
            <p class="price">¥${parseFloat(product.price).toFixed(2)}</p>
            <p class="description">${product.description || ''}</p>
            <p class="product-category">${translateText('产品分类：')}${product.category}</p>
            <p class="stock">${translateText('库存')}: ${product.stock}</p>
            <button onclick="addToCart(${product.id})" ${product.stock <= 0 ? 'disabled' : ''}>${translateText(product.stock <= 0 ? '库存不足' : '加入购物车')}</button>
            <button class="secondary-btn" onclick="trackBrowse(${product.id}, 30)">${translateText('记录浏览')}</button>
        </div>
    `;
}

async function addToCart(productId) {
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }
    try {
        const response = await fetchWithAuth(`${getApiBaseUrl()}/api/cart/add`, {
            method: 'POST',
            body: JSON.stringify({ productId, quantity: 1 })
        });
        if (response.ok) {
            showMessage('产品已添加到购物车', 'success');
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

async function trackBrowse(productId, durationSeconds = 10) {
    try {
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers.Authorization = `Bearer ${token}`;
        await fetch(`${getApiBaseUrl()}/api/analytics/browse`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ productId, durationSeconds })
        });
        showMessage('已记录浏览行为，用于用户画像和推荐分析', 'success');
    } catch (error) {
        console.error('记录浏览行为失败:', error);
    }
}

async function fetchRecommendations() {
    const container = document.getElementById('recommendationsContainer');
    if (!container) return;
    try {
        const response = await fetch(`${getApiBaseUrl()}/api/analytics/recommendations`);
        if (!response.ok) return;
        const data = await response.json();
        container.innerHTML = data.products.length ? data.products.map(product => productCard(product)).join('') : `<p class="empty-state">${translateText('暂无推荐商品')}</p>`;
        if (window.applyTranslations) window.applyTranslations();
    } catch (error) {
        console.error('获取推荐失败:', error);
    }
}
