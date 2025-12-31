const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();

// 调试中间件 - 第一个中间件，记录原始请求
app.use((req, res, next) => {
  console.log("原始请求:", req.method, req.url);
  console.log("Content-Type:", req.headers["content-type"]);
  console.log("Content-Length:", req.headers["content-length"]);
  next();
});

// 配置CORS
app.use(cors());

// JSON解析中间件 - 明确配置
app.use("/api", express.json({ 
  limit: "10mb",
  strict: false
}));

// URL编码解析中间件
app.use("/api", express.urlencoded({ extended: true, limit: "10mb" }));

// 调试中间件 - 检查解析后的请求体
app.use("/api", (req, res, next) => {
  console.log("解析后的请求体:", JSON.stringify(req.body));
  console.log("请求体keys:", Object.keys(req.body));
  next();
});

// 导入数据库连接
const db = require("./config/db");

// 导入模型
const { sequelize, User, Product, Cart, Order, OrderItem } = require("./models");

// 导入路由
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const adminRoutes = require("./routes/admin");
const emailRoutes = require("./routes/email");

// 使用路由
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/email", emailRoutes);

// 静态文件服务 - 提供前端文件
const frontendPath = path.resolve(__dirname, "../frontend");
console.log("前端文件路径:", frontendPath);
app.use(express.static(frontendPath));

// 提供前端路由
app.get("/admin*", (req, res) => {
  res.sendFile(path.join(frontendPath, "admin.html"));
});

app.get("/cart*", (req, res) => {
  res.sendFile(path.join(frontendPath, "cart.html"));
});

app.get("/orders*", (req, res) => {
  res.sendFile(path.join(frontendPath, "orders.html"));
});

app.get("/login*", (req, res) => {
  res.sendFile(path.join(frontendPath, "login.html"));
});

app.get("/register*", (req, res) => {
  res.sendFile(path.join(frontendPath, "register.html"));
});

app.get("/email*", (req, res) => {
  res.sendFile(path.join(frontendPath, "email.html"));
});

// 首页路由 - 提供前端首页
app.get("/", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// API首页路由
app.get("/api", (req, res) => {
  res.json({ message: "购物网站后端API正在运行" });
});

// 模型同步 - 创建数据库表
sequelize.sync({ force: false })
  .then(() => {
    console.log("数据库表同步成功");
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log("服务器正在运行在 http://localhost:" + PORT);
      console.log("服务器PID:", process.pid);
    });
    
    server.on("error", (err) => {
      console.error("服务器监听错误:", err);
    });
    
    process.on("uncaughtException", (err) => {
      console.error("未捕获的异常:", err);
      process.exit(1);
    });
    
    process.on("unhandledRejection", (reason, promise) => {
      console.error("未处理的Promise拒绝:", reason);
    });
  })
  .catch(err => {
    console.error("数据库表同步失败:", err);
  });