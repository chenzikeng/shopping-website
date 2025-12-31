// 支付和邮件功能测试脚本
require('dotenv').config();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch');

// 测试邮件发送功能
async function testEmailSending() {
    console.log('=== 测试邮件发送功能 ===');
    
    // 配置邮件传输器
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    
    // 测试连接
    try {
        await transporter.verify();
        console.log('✓ 邮件服务器连接成功');
        
        // 发送测试邮件
        const info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // 发送给自己测试
            subject: '测试邮件',
            text: '这是一封测试邮件，用于验证邮件发送功能是否正常工作。',
            html: '<b>这是一封测试邮件</b><p>用于验证邮件发送功能是否正常工作。</p>'
        });
        
        console.log('✓ 测试邮件发送成功，消息ID:', info.messageId);
        return true;
    } catch (error) {
        console.error('✗ 邮件发送失败:', error.message);
        return false;
    }
}

// 测试支付集成
async function testPaymentIntegration() {
    console.log('\n=== 测试支付集成 ===');
    
    // 模拟支付请求（这里使用虚拟支付服务）
    try {
        // 假设支付服务API
        const paymentResult = {
            payment_id: 'TEST_PAYMENT_' + Date.now(),
            status: 'success',
            amount: 99.99,
            currency: 'CNY',
            timestamp: new Date().toISOString()
        };
        
        console.log('✓ 模拟支付成功:', paymentResult);
        return true;
    } catch (error) {
        console.error('✗ 支付测试失败:', error.message);
        return false;
    }
}

// 测试订单创建流程
async function testOrderCreation() {
    console.log('\n=== 测试订单创建流程 ===');
    
    // 假设我们已经有一个测试用户的token
    const testUserToken = 'YOUR_TEST_USER_TOKEN'; // 请替换为实际的测试用户token
    
    try {
        // 测试创建订单
        const response = await fetch('http://localhost:3000/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${testUserToken}`
            },
            body: JSON.stringify({
                shippingAddress: '测试收货地址：北京市朝阳区科技园路1号',
                paymentMethod: 'alipay'
            })
        });
        
        if (response.ok) {
            const order = await response.json();
            console.log('✓ 订单创建成功:', order);
            return true;
        } else {
            const error = await response.json();
            console.error('✗ 订单创建失败:', error.message);
            return false;
        }
    } catch (error) {
        console.error('✗ 订单创建测试失败:', error.message);
        return false;
    }
}

// 测试管理员订单管理功能
async function testAdminOrderManagement() {
    console.log('\n=== 测试管理员订单管理功能 ===');
    
    // 假设我们已经有一个管理员的token
    const adminToken = 'YOUR_ADMIN_TOKEN'; // 请替换为实际的管理员token
    
    try {
        // 获取所有订单
        const response = await fetch('http://localhost:3000/api/admin/orders', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        });
        
        if (response.ok) {
            const orders = await response.json();
            console.log('✓ 获取所有订单成功，共', orders.length, '个订单');
            
            // 如果有订单，测试更新订单状态
            if (orders.length > 0) {
                const orderId = orders[0].id;
                const updateResponse = await fetch(`http://localhost:3000/api/admin/orders/${orderId}/status`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${adminToken}`
                    },
                    body: JSON.stringify({ status: 'shipped' })
                });
                
                if (updateResponse.ok) {
                    console.log('✓ 更新订单状态成功');
                    return true;
                } else {
                    const error = await updateResponse.json();
                    console.error('✗ 更新订单状态失败:', error.message);
                    return false;
                }
            }
            
            return true;
        } else {
            const error = await response.json();
            console.error('✗ 获取所有订单失败:', error.message);
            return false;
        }
    } catch (error) {
        console.error('✗ 管理员订单管理测试失败:', error.message);
        return false;
    }
}

// 主测试函数
async function runAllTests() {
    console.log('开始运行所有测试...');
    console.log('='.repeat(50));
    
    const results = {
        email: await testEmailSending(),
        payment: await testPaymentIntegration(),
        orderCreation: await testOrderCreation(),
        adminOrderMgmt: await testAdminOrderManagement()
    };
    
    console.log('\n' + '='.repeat(50));
    console.log('测试结果总结:');
    console.log('✓ 邮件发送:', results.email ? '成功' : '失败');
    console.log('✓ 支付集成:', results.payment ? '成功' : '失败');
    console.log('✓ 订单创建:', results.orderCreation ? '成功' : '失败');
    console.log('✓ 管理员订单管理:', results.adminOrderMgmt ? '成功' : '失败');
    
    const allSuccess = Object.values(results).every(result => result);
    console.log('\n整体测试:', allSuccess ? '全部成功' : '部分失败');
    
    return allSuccess;
}

// 运行测试
runAllTests().catch(console.error);
