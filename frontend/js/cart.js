// 页面加载时获取购物车数据
window.addEventListener('DOMContentLoaded', function() {
    fetchCart();
    
    // 结算按钮点击事件
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', showCheckoutForm);
    }
    
    // 取消结算按钮点击事件
    const cancelCheckoutBtn = document.getElementById('cancelCheckout');
    if (cancelCheckoutBtn) {
        cancelCheckoutBtn.addEventListener('click', hideCheckoutForm);
    }
    
    // 提交订单表单事件
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            checkout();
        });
    }
});

// 获取购物车数据
async function fetchCart() {
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/cart');
        if (response.ok) {
            const data = await response.json();
            displayCart(data.cartItems);
            updateCartSummary(data.cartItems, data.totalPrice);
        }
    } catch (error) {
        console.error('获取购物车失败:', error);
        showMessage('获取购物车失败，请稍后重试', 'error');
    }
}

// 显示购物车数据
function displayCart(cartItems) {
    const container = document.getElementById('cartContainer');
    
    if (cartItems.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>购物车是空的</h3>
                <p>快去挑选一些商品吧！</p>
            </div>
        `;
        document.getElementById('cartSummary').style.display = 'none';
        return;
    }
    
    container.innerHTML = cartItems.map(item => `
        <div class="cart-item">
            <div class="item-info">
                <h3>${item.Product.name}</h3>
                <p class="item-price">¥${parseFloat(item.Product.price).toFixed(2)}</p>
                <div class="item-quantity">
                    <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity - 1})">&minus;</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateCartItem(${item.id}, ${item.quantity + 1})">&plus;</button>
                </div>
                <p>小计: ¥${(parseFloat(item.Product.price) * item.quantity).toFixed(2)}</p>
            </div>
            <button class="delete-btn" onclick="deleteCartItem(${item.id})">删除</button>
        </div>
    `).join('');
    
    document.getElementById('cartSummary').style.display = 'block';
}

// 更新购物车商品数量
async function updateCartItem(itemId, quantity) {
    if (quantity <= 0) {
        deleteCartItem(itemId);
        return;
    }
    
    try {
        const response = await fetchWithAuth(`http://localhost:3000/api/cart/update/${itemId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity })
        });
        
        if (response.ok) {
            fetchCart();
            updateCartCount();
        } else {
            const data = await response.json();
            showMessage('更新购物车失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('更新购物车失败:', error);
        showMessage('更新购物车失败，请稍后重试', 'error');
    }
}

// 删除购物车商品
async function deleteCartItem(itemId) {
    try {
        const response = await fetchWithAuth(`http://localhost:3000/api/cart/remove/${itemId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchCart();
            updateCartCount();
            showMessage('商品已从购物车删除', 'success');
        } else {
            const data = await response.json();
            showMessage('删除商品失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('删除商品失败:', error);
        showMessage('删除商品失败，请稍后重试', 'error');
    }
}

// 更新购物车摘要
function updateCartSummary(cartItems, totalPrice) {
    // 如果提供了totalPrice参数，直接使用，否则计算
    if (typeof totalPrice === 'undefined') {
        totalPrice = cartItems.reduce((sum, item) => sum + parseFloat(item.Product.price) * item.quantity, 0);
    }
    document.getElementById('totalPrice').textContent = `¥${parseFloat(totalPrice).toFixed(2)}`;
}

// 显示结账表单
function showCheckoutForm() {
    document.getElementById('cartSummary').style.display = 'none';
    document.getElementById('checkoutForm').style.display = 'block';
}

// 隐藏结账表单
function hideCheckoutForm() {
    document.getElementById('checkoutForm').style.display = 'none';
    document.getElementById('cartSummary').style.display = 'block';
}

// 结算功能
async function checkout() {
    const shippingAddress = document.getElementById('shippingAddress').value;
    const paymentMethod = document.getElementById('paymentMethod').value;
    
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/orders', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress, paymentMethod })
        });
        
        if (response.ok) {
            const order = await response.json();
            showMessage('订单提交成功！', 'success');
            // 清空购物车并跳转到订单页面
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 1500);
        } else {
            const data = await response.json();
            showMessage('提交订单失败：' + data.message, 'error');
        }
    } catch (error) {
        console.error('提交订单失败:', error);
        showMessage('提交订单失败，请稍后重试', 'error');
    }
}