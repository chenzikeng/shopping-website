// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 检查用户是否已登录
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    // 绑定检查邮件按钮事件
    document.getElementById('checkEmailBtn').addEventListener('click', checkEmail);

    // 退出登录功能
    document.getElementById('logoutBtn').addEventListener('click', logout);
});

// 检查邮件函数
async function checkEmail() {
    const emailAddress = document.getElementById('emailAddress').value;
    
    if (!emailAddress) {
        showMessage('请输入邮箱地址', 'error');
        return;
    }

    try {
        // 调用后端API检查邮件
        const response = await fetch('http://localhost:3000/api/email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: emailAddress })
        });

        if (!response.ok) {
            throw new Error('检查邮件失败，状态码: ' + response.status);
        }

        const emails = await response.json();
        console.log('获取到的邮件:', emails);
        displayEmails(emails);
    } catch (error) {
        console.error('检查邮件错误:', error);
        showMessage('检查邮件失败: ' + error.message, 'error');
    }
}

// 显示邮件列表
function displayEmails(emails) {
    const emailList = document.getElementById('emailList');
    
    if (emails.length === 0) {
        emailList.innerHTML = '<p class="no-emails">没有找到邮件</p>';
        return;
    }

    let html = '<div class="email-container">';
    
    emails.forEach(email => {
        html += `
            <div class="email-item">
                <div class="email-header">
                    <h3 class="email-subject">${email.subject}</h3>
                    <span class="email-time">${email.timestamp}</span>
                </div>
                <div class="email-sender">发件人: ${email.from}</div>
                <div class="email-body">${email.body}</div>
            </div>
        `;
    });
    
    html += '</div>';
    emailList.innerHTML = html;
}



// 退出登录
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}