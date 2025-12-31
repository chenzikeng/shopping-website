// 页面加载时获取订单列表
window.addEventListener('DOMContentLoaded', function() {
    fetchOrders();
});

// 获取订单列表
async function fetchOrders() {
    try {
        const response = await fetchWithAuth('http://localhost:3000/api/orders');
        
        if (response.ok) {
            const orders = await response.json();
            displayOrders(orders);
        } else {
            // 尝试解析错误信息
            try {
                const errorData = await response.json();
                showMessage('获取订单列表失败: ' + errorData.message, 'error');
            } catch (e) {
                showMessage('获取订单列表失败，请稍后重试', 'error');
            }
        }
    } catch (error) {
        showMessage('获取订单列表失败，请稍后重试', 'error');
    }
}

// 展示订单列表
function displayOrders(orders) {
    const container = document.getElementById('ordersContainer');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h3>还没有订单记录</h3>
                <p>快去下单购买商品吧！</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">订单号: ${order.id}</div>
                <div class="order-status status-${order.status}">
                    ${getStatusText(order.status)}
                </div>
                ${order.status === 'pending' ? `<button class="btn btn-primary" onclick="processPayment(${order.id})">待付款</button>` : ''}
            </div>
            <div class="order-items">
                ${order.OrderItems.map(item => `
                    <div class="order-item">
                        <div>
                            <span>${item.Product.name}</span>
                            <span> x ${item.quantity}</span>
                        </div>
                        <div>¥${parseFloat(item.Product.price * item.quantity).toFixed(2)}</div>
                    </div>
                `).join('')}
            </div>
            <div class="order-summary">
                订单总价: ¥${parseFloat(order.totalAmount).toFixed(2)}
            </div>
            <div class="order-info">
                <p>下单时间: ${new Date(order.createdAt).toLocaleString()}</p>
                <p>收货地址: ${order.shippingAddress}</p>
                <p>支付方式: ${getPaymentMethodText(order.paymentMethod)}</p>
            </div>
        </div>
    `).join('');
}

// 处理支付
async function processPayment(orderId) {
    console.log('开始处理支付，订单ID:', orderId);
    try {
        const response = await fetchWithAuth(`http://localhost:3000/api/orders/${orderId}/pay`, {
            method: 'POST'
        });
        
        console.log('支付请求响应状态:', response.status);
        console.log('支付请求响应头:', response.headers);
        
        if (response.ok) {
            const result = await response.json();
            console.log('支付成功响应:', result);
            showMessage('支付成功', 'success');
            // 刷新订单列表
            fetchOrders();
        } else {
            // 尝试解析错误信息
            try {
                const errorData = await response.json();
                console.log('支付失败响应:', errorData);
                showMessage('支付失败: ' + errorData.message, 'error');
            } catch (e) {
                console.log('无法解析错误信息:', e);
                const text = await response.text();
                console.log('原始错误响应:', text);
                showMessage('支付失败，请稍后重试', 'error');
            }
        }
    } catch (error) {
        console.log('支付请求异常:', error);
        showMessage('支付失败，请稍后重试', 'error');
    }
}

// 获取订单状态文本
function getStatusText(status) {
    const statusMap = {
        'pending': '待付款',
        'paid': '已付款',
        'shipped': '已发货',
        'delivered': '已送达',
        'cancelled': '已取消'
    };
    return statusMap[status] || status;
}

// 获取支付方式文本
function getPaymentMethodText(method) {
    const methodMap = {
        'alipay': '支付宝',
        'wechat': '微信支付',
        'card': '银行卡'
    };
    return methodMap[method] || method;
}