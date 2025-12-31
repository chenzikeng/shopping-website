# 前端与后端服务集成指南

## 问题解答
您的问题"我在前端怎末开启后端服务"可能有两种理解：

### 理解1：如何在前端代码中配置后端API地址
### 理解2：如何在本地环境中启动后端服务

我将为您提供完整的解决方案。

---

## 第一部分：启动后端服务

### 1. 确认后端环境
确保已安装Node.js和npm：
```bash
node --version
npm --version
```

### 2. 安装后端依赖
```bash
cd backend
npm install
```

### 3. 配置数据库
确保MySQL数据库已启动，并且`.env`文件中的数据库配置正确：
- DB_HOST=localhost
- DB_USER=root  
- DB_PASSWORD=您的数据库密码
- DB_NAME=shopping_db

### 4. 启动后端服务
```bash
# 开发模式（推荐，用于调试）
npm run dev

# 或者生产模式
npm start
```

**后端服务启动后将在 http://localhost:3000 运行**

---

## 第二部分：前端配置后端API

### 1. 创建API配置文件npm start
在前端目录创建 `js/config.js` 文件：

```javascript
// frontend/js/config.js
const API_CONFIG = {
    // 开发环境
    development: {
        baseURL: 'http://localhost:3000/api',
        timeout: 10000
    },
    // 生产环境（部署到服务器后）
    production: {
        baseURL: 'http://您的服务器IP:3000/api',
        timeout: 10000
    },
    
    // 获取当前环境的配置
    getCurrentConfig() {
        const env = window.location.hostname === 'localhost' ? 'development' : 'production';
        return this[env];
    },
    
    // 获取API基础URL
    getBaseURL() {
        return this.getCurrentConfig().baseURL;
    },
    
    // 构建完整的API URL
    getAPIUrl(endpoint) {
        const baseURL = this.getBase