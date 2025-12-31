# 配置测试参数
$BASE_URL = "http://localhost:3000/api"
$USER_EMAIL = "test@example.com"
$USER_PASSWORD = "password123"
$ADMIN_EMAIL = "admin@example.com"
$ADMIN_PASSWORD = "admin123"

Write-Host "=== 开始测试邮件流程 ===" -ForegroundColor Green

Try {
    # 1. 用户登录
    Write-Host "1. 用户登录..." -ForegroundColor Cyan
    $loginParams = @{
        email = $USER_EMAIL
        password = $USER_PASSWORD
    }
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body ($loginParams | ConvertTo-Json) -ContentType "application/json"
    
    if (-not $loginResponse.token) {
        throw "登录失败：未获取到token"
    }
    
    $token = $loginResponse.token
    Write-Host "登录成功，获取到token" -ForegroundColor Green
    
    # 设置请求头
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    # 2. 创建订单（直接创建，不经过购物车）
    Write-Host "2. 创建订单..." -ForegroundColor Cyan
    $createOrderResponse = Invoke-RestMethod -Uri "$BASE_URL/orders/create" -Method Post -Headers $headers
    
    if (-not $createOrderResponse.order -or -not $createOrderResponse.order.id) {
        throw "创建订单失败：未获取到订单ID"
    }
    
    $orderId = $createOrderResponse.order.id
    Write-Host "订单创建成功，订单号：$orderId" -ForegroundColor Green
    
    # 3. 支付订单
    Write-Host "3. 支付订单..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BASE_URL/orders/$orderId/pay" -Method Post -Headers $headers | Out-Null
    Write-Host "订单支付成功" -ForegroundColor Green
    
    # 4. 检查订单确认邮件
    Write-Host "4. 检查订单确认邮件..." -ForegroundColor Cyan
    $emailCheckParams = @{
        email = $USER_EMAIL
    }
    $emailsBeforeShip = Invoke-RestMethod -Uri "$BASE_URL/email" -Method Post -Body ($emailCheckParams | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "创建订单后邮件数量：$($emailsBeforeShip.Count)" -ForegroundColor Yellow
    foreach ($email in $emailsBeforeShip) {
        Write-Host "- $($email.subject)" -ForegroundColor Yellow
    }
    
    # 5. 管理员登录
    Write-Host "5. 管理员登录..." -ForegroundColor Cyan
    $adminLoginParams = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
    }
    $adminLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method Post -Body ($adminLoginParams | ConvertTo-Json) -ContentType "application/json"
    
    $adminToken = $adminLoginResponse.token
    $adminHeaders = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    Write-Host "管理员登录成功" -ForegroundColor Green
    
    # 6. 确认发货
    Write-Host "6. 确认发货..." -ForegroundColor Cyan
    Invoke-RestMethod -Uri "$BASE_URL/orders/$orderId/ship" -Method Post -Headers $adminHeaders | Out-Null
    Write-Host "订单确认发货成功" -ForegroundColor Green
    
    # 7. 检查发货通知邮件
    Write-Host "7. 检查发货通知邮件..." -ForegroundColor Cyan
    $emailsAfterShip = Invoke-RestMethod -Uri "$BASE_URL/email" -Method Post -Body ($emailCheckParams | ConvertTo-Json) -ContentType "application/json"
    
    Write-Host "确认发货后邮件数量：$($emailsAfterShip.Count)" -ForegroundColor Yellow
    foreach ($email in $emailsAfterShip) {
        Write-Host "- $($email.subject)" -ForegroundColor Yellow
    }
    
    # 8. 验证测试结果
    if ($emailsAfterShip.Count -ge 2) {
        Write-Host "✅ 测试成功！已收到订单确认邮件和发货通知邮件" -ForegroundColor Green
    } else {
        Write-Host "❌ 测试失败！未收到预期的邮件数量" -ForegroundColor Red
    }
    
    # 9. 展示收到的邮件
    Write-Host "`n=== 收到的邮件详情 ===" -ForegroundColor Cyan
    foreach ($email in $emailsAfterShip) {
        Write-Host "`n邮件主题：$($email.subject)" -ForegroundColor Yellow
        Write-Host "发件人：$($email.from)" -ForegroundColor Gray
        Write-Host "时间：$($email.timestamp)" -ForegroundColor Gray
        Write-Host "内容预览：$($email.body.Substring(0, [math]::Min(100, $email.body.Length)))..." -ForegroundColor Gray
    }
    
} Catch {
    Write-Host "`n❌ 测试过程中发生错误：$($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream() | Get-Content -Encoding UTF8
        Write-Host "错误响应：$errorContent" -ForegroundColor Red
    }
}

Write-Host "`n=== 邮件流程测试完成 ===" -ForegroundColor Green