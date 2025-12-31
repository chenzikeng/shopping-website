const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "123456",
      database: "shopping_db"
    });
    
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    await connection.execute(
      "INSERT INTO Users (name, email, password, phone, address, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())",
      ["管理员", "admin@example.com", hashedPassword, "13800138000", "管理员地址", "admin"]
    );
    
    console.log("管理员账户创建成功");
    console.log("邮箱: admin@example.com");
    console.log("密码: admin123");
    
    await connection.end();
  } catch (error) {
    console.error("创建失败:", error.message);
  }
}

createAdmin();