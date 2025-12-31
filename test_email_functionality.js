// 测试邮件功能完整性
const http = require('http');

// 测试发送邮件
const testSendEmail = () => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({
            from: 'noreply@onlineshop.com',
            to: 'test@example.com',
            subject: '最终测试邮件',
            body: '<h1>测试邮件内容</h1><p>这是一封用于最终测试的邮件</p>'
        });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/email/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const result = JSON.parse(body);
                    console.log('✅ 发送邮件成功:', result.message);
                    resolve(result.email);
                } catch (error) {
                    console.error('❌ 解析发送邮件响应错误:', error);
                    reject(error);
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ 发送邮件错误:', e);
            reject(e);
        });

        req.write(data);
        req.end();
    });
};

// 测试获取邮件
const testGetEmail = (emailAddress) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email: emailAddress });

        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/email',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const emails = JSON.parse(body);
                    console.log(`✅ 获取邮件成功: 共${emails.length}封邮件`);
                    resolve(emails);
                } catch (error) {
                    console.error('❌ 解析获取邮件响应错误:', error);
                    console.error('响应内容:', body);
                    reject(error);
                }
            });
        });

        req.on('error', (e) => {
            console.error('❌ 获取邮件错误:', e);
            reject(e);
        });

        req.write(data);
        req.end();
    });
};

// 运行完整测试流程
const runCompleteTest = async () => {
    console.log('开始邮件功能完整测试...\n');
    
    try {
        // 步骤1: 发送测试邮件
        await testSendEmail();
        
        // 步骤2: 获取邮件列表
        const emails = await testGetEmail('test@example.com');
        
        // 步骤3: 显示邮件详情
        if (emails.length > 0) {
            console.log('\n📧 邮件详情:');
            emails.forEach((email, index) => {
                console.log(`\n邮件 ${index + 1}:`);
                console.log(`- ID: ${email.id}`);
                console.log(`- 发件人: ${email.from}`);
                console.log(`- 收件人: ${email.to}`);
                console.log(`- 主题: ${email.subject}`);
                console.log(`- 时间: ${email.timestamp}`);
                console.log(`- 内容: ${email.body}`);
            });
        }
        
        console.log('\n🎉 邮件功能测试完成！');
        console.log('\n请在前端页面中输入 test@example.com 并点击检查邮件按钮查看邮件。');
        console.log('前端地址: http://localhost:8080/email.html');
        
    } catch (error) {
        console.error('\n❌ 测试失败:', error);
    }
};

// 运行测试
runCompleteTest();