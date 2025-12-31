require('dotenv').config({ path: './backend/.env' });
const { Sequelize } = require('sequelize');

console.log('测试数据库连接配置...');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : '未设置');
console.log('DB_NAME:', process.env.DB_NAME);

// 创建数据库连接
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: 3306,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    logging: console.log
  }
);

// 测试数据库连接
async function testConnection() {
  try {
    console.log('\n正在连接数据库...');
    await sequelize.authenticate();
    console.log('数据库连接成功！');
    
    // 执行简单查询
    console.log('\n正在执行简单查询...');
    const [result, metadata] = await sequelize.query('SELECT 1+1 AS result');
    console.log('查询结果:', result);
    
    // 保持脚本运行
    console.log('\n脚本将保持运行...');
    setTimeout(() => {
      console.log('脚本正常结束');
      process.exit(0);
    }, 10000);
    
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
}

testConnection();