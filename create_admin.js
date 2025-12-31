const { sequelize } = require('./backend/models');
const User = require('./backend/models/User');

// 创建管理员账号的函数
async function createAdmin() {
  try {
    // 确保数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 定义管理员账号信息
    const adminData = {
      name: 'Admin',
      email: 'admin@example.com',
      password: 'admin123',
      phone: '13800138000',
      address: '管理员地址',
      role: 'admin'
    };

    // 检查是否已存在管理员账号
    const existingAdmin = await User.findOne({ where: { role: 'admin' } });
    if (existingAdmin) {
      console.log('管理员账号已存在:', existingAdmin.email);
      return;
    }

    // 创建管理员账号
    const admin = await User.create(adminData);
    console.log('管理员账号创建成功:');
    console.log('邮箱:', admin.email);
    console.log('密码:', adminData.password);
    console.log('角色:', admin.role);
    console.log('ID:', admin.id);
  } catch (error) {
    console.error('创建管理员账号失败:', error);
  } finally {
    // 关闭数据库连接
    await sequelize.close();
  }
}

// 执行创建管理员账号
createAdmin();