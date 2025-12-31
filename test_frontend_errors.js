// 测试前端页面的JavaScript错误
const http = require('http');
const cheerio = require('cheerio');

// 获取前端页面的HTML内容
const getPageContent = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (error) => {
            reject(error);
        });
    });
};

// 检查页面中的JavaScript错误
const checkJavaScriptErrors = async () => {
    try {
        // 获取email.html页面的内容
        const html = await getPageContent('http://localhost:8080/email.html');
        
        // 使用cheerio解析HTML
        const $ = cheerio.load(html);
        
        // 获取所有script标签
        const scripts = $('script');
        
        console.log('页面中的script标签数量:', scripts.length);
        
        // 检查script标签是否正确
        scripts.each((index, script) => {
            const src = $(script).attr('src');
            if (src) {
                console.log('Script标签src:', src);
            } else {
                console.log('内联script标签:', $(script).html());
            }
        });
        
        // 检查页面结构
        console.log('是否有container元素:', $('.container').length > 0);
        console.log('是否有email-section元素:', $('.email-section').length > 0);
        console.log('是否有email-input元素:', $('.email-input').length > 0);
        console.log('是否有email-list元素:', $('.email-list').length > 0);
        console.log('是否有emailAddress元素:', $('#emailAddress').length > 0);
        console.log('是否有checkEmailBtn元素:', $('#checkEmailBtn').length > 0);
        console.log('是否有emailList元素:', $('#emailList').length > 0);
        
    } catch (error) {
        console.error('获取页面内容错误:', error);
    }
};

// 运行测试
checkJavaScriptErrors();