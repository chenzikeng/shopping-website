# 测试网站连接的PowerShell脚本

Write-Host "=== 购物网站连接测试 ===" -ForegroundColor Green

# 测试网站连通性
Write-Host "`n1. 测试网站连通性..." -ForegroundColor Yellow
try {
    $response = Test-NetConnection -ComputerName "8.148.199.180" -Port 3000 -WarningAction SilentlyContinue
    if ($response.TcpTestSucceeded) {
        Write-Host "✓ 端口3000连接成功" -ForegroundColor Green
    } else {
        Write-Host "✗ 端口3000连接失败" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ 连接测试失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试HTTP响应
Write-Host "`n2. 测试HTTP响应..." -ForegroundColor Yellow
try {
    $webResponse = Invoke-WebRequest -Uri "http://8.148.199.180:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "✓ HTTP响应状态: $($webResponse.StatusCode)" -ForegroundColor Green
    Write-Host "✓ 响应内容长度: $($webResponse.Content.Length) 字符" -ForegroundColor Green
} catch {
    Write-Host "✗ HTTP请求失败: $($_.Exception.Message)" -ForegroundColor Red
}

# 测试首页
Write-Host "`n3. 测试首页内容..." -ForegroundColor Yellow
try {
    $content = Invoke-WebRequest -Uri "http://8.148.199.180:3000" -UseBasicParsing -TimeoutSec 10
    if ($content.Content -match "购物网站|登录|注册") {
        Write-Host "✓ 首页内容正确" -ForegroundColor Green
    } else {
        Write-Host "? 首页内容可能异常" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ 获取首页内容失败: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== 测试完成 ===" -ForegroundColor Green