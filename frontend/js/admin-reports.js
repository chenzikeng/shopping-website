document.addEventListener('DOMContentLoaded', () => {
    loadStatistics();
    loadTrend();
    loadLeaderboard();
    loadForecast();
    loadMonitor();
});

async function loadStatistics() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/admin/statistics`);
    if (!response.ok) return;
    const data = await response.json();
    document.getElementById('totalSales').textContent = `¥${Number(data.totalSales || 0).toFixed(2)}`;
    document.getElementById('totalOrders').textContent = data.totalOrders || 0;
    document.getElementById('avgOrderAmount').textContent = `¥${Number(data.averageOrderAmount || 0).toFixed(2)}`;
    renderTopProducts(data.bestSellingProducts || []);
}

async function loadTrend() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/analytics/sales-trends?period=day&days=30`);
    if (!response.ok) return;
    const data = await response.json();
    const labels = data.rows.map(row => row.period);
    const sales = data.rows.map(row => Number(row.sales || 0));
    const ctx = document.getElementById('salesChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{ label: '销售额', data: sales, borderColor: '#3498db', backgroundColor: 'rgba(52, 152, 219, 0.15)', tension: 0.3, fill: true }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });
}

async function loadLeaderboard() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/analytics/leaderboard`);
    if (!response.ok) return;
    const data = await response.json();
    renderTopProducts(data.rows.map(row => ({
        name: row.Product.name,
        quantity: row.quantity || 0,
        revenue: row.revenue || 0
    })));
}

async function loadForecast() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/analytics/forecast`);
    if (!response.ok) return;
    const data = await response.json();
    const el = document.getElementById('salesForecast');
    if (el) el.textContent = `明日预测销售额：¥${Number(data.nextDayPrediction || 0).toFixed(2)}，${data.evaluation}`;
}

async function loadMonitor() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/analytics/monitor`);
    if (!response.ok) return;
    const data = await response.json();
    const container = document.getElementById('monitorAlerts');
    if (!container) return;
    if (!data.alerts.length) {
        container.innerHTML = '<p class="empty-state">暂无销售异常</p>';
        return;
    }
    container.innerHTML = data.alerts.map(alert => `<div class="alert-card ${alert.level}">${alert.message}</div>`).join('');
}

function renderTopProducts(products) {
    const tbody = document.querySelector('#topProductsTable tbody');
    tbody.innerHTML = products.map((product, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${product.name}</td>
            <td>${product.quantity}</td>
            <td>¥${Number(product.revenue || 0).toFixed(2)}</td>
        </tr>
    `).join('');
}
