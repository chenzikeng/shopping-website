// 页面加载时获取订单列表
window.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

// 获取订单列表
async function fetchOrders() {
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/admin/orders');
        if (response.ok) {
            const data = await response.json();
            displayOrders(data.orders);
        }
    } catch (error) {
        console.error('获取订单列表失败:', error);
        showMessage('获取订单列表失败，请稍后重试', 'error');
    }
}

// 展示订单列表
function displayOrders(orders) {
    const container = document.getElementById('adminOrdersContainer');
    container.innerHTML = '';

    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.className = 'admin-order-card';
        
        // 构建订单商品列表HTML
        const orderItemsHtml = order.OrderItems.map(item => `
            <div class="order-item">
                <span>${item.Product.name}</span>
                <span>数量: ${item.quantity}</span>
                <span>单价: ¥${parseFloat(item.price).toFixed(2)}</span>
                <span>小计: ¥${parseFloat(item.price * item.quantity).toFixed(2)}</span>
            </div>
        `).join('');
        
        orderElement.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <h3>订单号: ${order.id}</h3>
                    <p>用户: ${order.User.name} (${order.User.email})</p>
                    <p>总价: ¥${parseFloat(order.totalAmount).toFixed(2)}</p>
                    <p>创建时间: ${new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div class="order-status-section">
                    <span>当前状态: </span>
                    <select onchange="updateOrderStatus(${order.id}, this.value)" class="status-select">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>待处理</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>处理中</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>已发货</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>已送达</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>已取消</option>
                    </select>
                </div>
            </div>
            <div class="order-items">
                <h4>订单商品:</h4>
                ${orderItemsHtml}
            </div>
            <div class="order-details">
                <p>收货地址: ${order.shippingAddress}</p>
                <p>支付方式: ${getPaymentMethodText(order.paymentMethod)}</p>
            </div>
        `;
        
        container.appendChild(orderElement);
    });
}

// 更新订单状态
async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetchWithAuth(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status: newStatus })
        });
        
        if (response.ok) {
            showMessage('订单状态更新成功', 'success');
            // 如果状态改为已发货，系统会自动发送发货通知邮件
            if (newStatus === 'shipped') {
                showMessage('已发送发货通知邮件', 'success');
            }
        } else {
            const data = await response.json();
            showMessage('更新订单状态失败：' + data.message, 'error');
            // 恢复原来的选择
            fetchOrders();
        }
    } catch (error) {
        console.error('更新订单状态失败:', error);
        showMessage('更新订单状态失败，请稍后重试', 'error');
        // 恢复原来的选择
        fetchOrders();
    }
}

// 获取支付方式文本
function getPaymentMethodText(paymentMethod) {
    const paymentMethods = {
        'alipay': '支付宝',
        'wechat': '微信支付',
        'card': '银行卡'
    };
    return paymentMethods[paymentMethod] || paymentMethod;
}
