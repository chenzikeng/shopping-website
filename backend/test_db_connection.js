const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

console.log('测试数据库连接...');
console.log('环境变量加载情况:');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已加载***' : '未加载');
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
    logging: console.log,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
sequelize.authenticate()
  .then(() => {
    console.log('\n✅ 数据库连接成功');
    process.exit(0);
  })
  .catch(err => {
    console.error('\n❌ 数据库连接失败:', err);
    console.error('错误详情:', JSON.stringify(err, null, 2));
    process.exit(1);
  });
