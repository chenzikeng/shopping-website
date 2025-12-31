Write-Host "=== 网站访问测试 ===" -ForegroundColor Green

try {
    Write-Host "正在测试 http://8.148.199.180:3000 ..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "http://8.148.199.180:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ 网站访问成功!" -ForegroundColor Green
    Write-Host ("状态码: " + $response.StatusCode)
    Write-Host ("内容长度: " + $response.Content.Length + " 字符")
    
    if ($response.Content -match "购物网站|登录|注册") {
        Write-Host "✅ 页面内容正常" -ForegroundColor Green
    } else {
        Write-Host "⚠️  页面内容可能异常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ 网站访问失败" -ForegroundColor Red
    Write-Host ("错误信息: " + $_.Exception.Message)
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green