// 简单的前端页面测试脚本
const http = require('http');

// 检查前端页面是否能够正常访问
const checkPageAccess = () => {
    console.log('检查前端页面是否能够正常访问...');
    
    // 检查email.html页面
    const options = {
        hostname: 'localhost',
        port: 8080,
        path: '/email.html',
        method: 'GET'
    };
    
    http.request(options, (res) => {
        console.log('email.html响应状态码:', res.statusCode);
        
        // 检查js文件是否能够正常访问
        checkJsFiles();
    }).on('error', (error) => {
        console.error('访问email.html错误:', error);
    }).end();
};

// 检查JavaScript文件是否能够正常访问
const checkJsFiles = () => {
    const jsFiles = ['/js/common.js', '/js/email.js'];
    
    jsFiles.forEach((file, index) => {
        setTimeout(() => {
            const options = {
                hostname: 'localhost',
                port: 8080,
                path: file,
                method: 'GET'
            };
            
            http.request(options, (res) => {
                console.log(`${file}响应状态码:`, res.statusCode);
            }).on('error', (error) => {
                console.error(`访问${file}错误:`, error);
            }).end();
        }, index * 500);
    });
};

// 运行测试
checkPageAccess();