document.addEventListener('DOMContentLoaded', () => {
    loadSalesUsers();
    loadOperationLogs();
    document.getElementById('addSalesForm').addEventListener('submit', async e => {
        e.preventDefault();
        await addSalesUser();
    });
});

async function loadSalesUsers() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/management/sales-users`);
    if (!response.ok) return;
    const data = await response.json();
    const container = document.getElementById('salesUsersContainer');
    container.innerHTML = `
        <table class="data-table">
            <thead><tr><th>ID</th><th>姓名</th><th>邮箱</th><th>电话</th><th>创建时间</th><th>操作</th></tr></thead>
            <tbody>${data.users.map(user => `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.email}</td>
                    <td>${user.phone || '-'}</td>
                    <td>${new Date(user.createdAt).toLocaleString()}</td>
                    <td>
                        <button class="edit-btn" onclick="resetPassword(${user.id})">重置密码</button>
                        <button class="delete-btn" onclick="deleteSalesUser(${user.id})">删除</button>
                    </td>
                </tr>`).join('')}</tbody>
        </table>`;
}

async function addSalesUser() {
    const body = {
        name: document.getElementById('salesName').value,
        email: document.getElementById('salesEmail').value,
        password: document.getElementById('salesPassword').value,
        phone: document.getElementById('salesPhone').value
    };
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/management/sales-users`, { method: 'POST', body: JSON.stringify(body) });
    const data = await response.json();
    showMessage(data.message, response.ok ? 'success' : 'error');
    if (response.ok) {
        document.getElementById('addSalesForm').reset();
        loadSalesUsers();
        loadOperationLogs();
    }
}

async function resetPassword(id) {
    const password = prompt('请输入新密码');
    if (!password) return;
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/management/sales-users/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) });
    const data = await response.json();
    showMessage(data.message, response.ok ? 'success' : 'error');
    loadOperationLogs();
}

async function deleteSalesUser(id) {
    if (!confirm('确定删除该销售人员吗？')) return;
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/management/sales-users/${id}`, { method: 'DELETE' });
    const data = await response.json();
    showMessage(data.message, response.ok ? 'success' : 'error');
    if (response.ok) {
        loadSalesUsers();
        loadOperationLogs();
    }
}

async function loadOperationLogs() {
    const response = await fetchWithAuth(`${getApiBaseUrl()}/api/management/logs/operations`);
    if (!response.ok) return;
    const data = await response.json();
    const container = document.getElementById('operationLogsContainer');
    container.innerHTML = `
        <table class="data-table">
            <thead><tr><th>时间</th><th>账号</th><th>角色</th><th>内容</th><th>IP</th></tr></thead>
            <tbody>${data.logs.map(log => `
                <tr>
                    <td>${new Date(log.createdAt).toLocaleString()}</td>
                    <td>${log.account || '-'}</td>
                    <td>${log.role || '-'}</td>
                    <td>${log.action}：${log.content || ''}</td>
                    <td>${log.ipAddress || '-'}</td>
                </tr>`).join('')}</tbody>
        </table>`;
}
